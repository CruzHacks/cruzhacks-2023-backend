const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateHacker, hasReadHacker } = require("../../utils/middleware");
const { setDocument, queryDocument, updateDocument, dbTransaction, documentRef } = require("../../utils/database");

const teams = express();
teams.disable("x-powered-by");
teams.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

teams.use(cors(corsOptions));

teams.post("/createTeam", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const teamName = req.body.teamName;
    const teamLeader = req.user.sub;
    const teamLeaderName = req.body.teamLeaderName;
    const checkNameDoc = await queryDocument("Teams", teamName);

    const userDoc = (await queryDocument("Hackers", req.user.sub)).data();
    if (userDoc.invitationMode !== "CREATE") {
      res.status(500).send({ status: 500, error: "Invalid Invitation Mode" });
      return;
    }

    if (userDoc.team.teamLeader) {
      res.status(500).send({ status: 500, error: "User has Team" });
      return;
    }

    if (checkNameDoc.exists) {
      functions.logger.log(`Error Creating Team: ${teamName},\nError: Team Name Taken`);
      res.status(500).send({ status: 500, error: "Team Name Taken" });
      return;
    }

    const teamDoc = {
      teamLeader: teamLeader,
      members: [
        {
          memberEmail: userDoc.email,
          memberName: teamLeaderName,
          memberID: req.user.sub,
        },
      ],
      invitedMembers: [],
    };

    await setDocument("Teams", teamName, teamDoc);

    let team = {
      teamLeader: teamLeader,
      teamName: teamName,
    };

    await updateDocument("Hackers", req.user.sub, { team: team });

    let membersRes = [{ memberName: teamDoc.members[0].memberName, memberID: teamDoc.members[0].memberID }];

    res.status(201).send({
      status: 201,
      ...team,
      members: membersRes,
      message: "Team Created",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: 500, message: "Could Not Create Team" });
  }
});

teams.put("/changeInvitationMode", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const doc = (await queryDocument("Hackers", req.user.sub)).data();
    if (doc.team.teamLeader && doc.team.teamLeader === req.user.sub) {
      res.status(500).send({ status: 500, error: "You Must Delete Your Team Before Changing Invitation Modes" });
      return;
    }
    if (doc.team.teamName) {
      res.status(500).send({ status: 500, error: "You Must Leave Your Current Team Before Changing Invitation Modes" });
      return;
    }
    const newInvitationMode = doc.invitationMode === "CREATE" ? "JOIN" : "CREATE";
    await updateDocument("Hackers", req.user.sub, { invitationMode: newInvitationMode });
    res.status(200).send({ status: 200, newInvitationMode: newInvitationMode });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: 500, error: "Could Not Update Invitation Mode" });
  }
});

teams.post("/inviteTeamMember", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const invitedMemberEmail = req.body.invitedMember;
    const userDoc = (await queryDocument("Hackers", req.user.sub)).data();
    const teamName = userDoc.team.teamName;

    if (!teamName) {
      res.status(500).send({ status: 500, error: "Hacker Does Not Have A Team" });
      return;
    }

    const teamDoc = (await queryDocument("Teams", teamName)).data();
    if (teamDoc.teamLeader !== req.user.sub) {
      res.status(500).send({ status: 500, error: "Hacker Is Not The Team Leader" });
      return;
    }

    if (teamDoc.members.length + teamDoc.invitedMembers.length >= 4) {
      res.status(500).send({ status: 500, error: "You Have Invited The Max Number of Hackers" });
      return;
    }

    if (teamDoc.members.some((e) => e.memberEmail === invitedMemberEmail)) {
      res.status(500).send({ status: 500, error: "This Hacker Is Already In Your Team" });
      return;
    }

    if (teamDoc.invitedMembers.some((e) => e.memberEmail === invitedMemberEmail)) {
      res.status(500).send({ status: 500, error: "This Hacker Is Already Invited" });
      return;
    }

    const reverseSearchDoc = (await queryDocument("Searches", "auth0IDSearch")).data();
    const invitedMemberAuth0ID = reverseSearchDoc.emailSearch[invitedMemberEmail];
    let newInvitedMembers = [];

    await dbTransaction(async (t) => {
      const invitedMemberDocRef = documentRef("Hackers", invitedMemberAuth0ID);
      const invitedMemberDoc = (await t.get(invitedMemberDocRef)).data();
      const teamDocRef = documentRef("Teams", teamName);
      const teamDoc = (await t.get(teamDocRef)).data();
      let invitations = invitedMemberDoc.invitations;
      invitations.push({ teamName: teamName });

      newInvitedMembers = teamDoc.invitedMembers;
      newInvitedMembers.push({
        memberEmail: invitedMemberEmail,
        memberID: invitedMemberAuth0ID,
        memberName: `${invitedMemberDoc.firstName} ${invitedMemberDoc.lastName}`,
      });

      t.update(invitedMemberDocRef, { invitations: invitations });
      t.update(teamDocRef, { invitedMembers: newInvitedMembers });
    });

    res.status(200).send({ status: 200, invitedMembers: newInvitedMembers });
  } catch (err) {
    functions.logger.log(`Could Not Invite ${req.body.invitedMember}\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Unable to Invite" });
  }
});

teams.post("/rsvpInvite", jwtCheck, hasUpdateHacker, async (req, res) => {
  // Remove hacker from invitedMembers in teamDoc
  // Add hacker to team member
  // Remove team invitation from hackers doc
  // Add team to hackers team

  try {
    const hackerDoc = (await queryDocument("Hackers", req.user.sub)).data();

    if (hackerDoc.team.teamName) {
      res.status(400).send({ status: 400, error: "Leave current team before joining another one" });
      return;
    }
    const decision = req.body.decision;
    const teamName = req.body.teamName;
    let newInvitations = [];

    await dbTransaction(async (t) => {
      try {
        const teamDocRef = documentRef("Teams", teamName);
        const teamDoc = (await t.get(teamDocRef)).data();
        const teamLeader = teamDoc.teamLeader;
        let invitedMembers = teamDoc.invitedMembers;

        if (!invitedMembers.some((e) => e.memberID === req.user.sub)) {
          throw new Error("Hacker is not invited to this team");
        }
        let invitedMemberElement = {};

        const newInvitedMembers = invitedMembers.filter((element) => {
          if (element.memberID === req.user.sub) {
            invitedMemberElement = element;
            return false;
          }
          return true;
        });

        let members = teamDoc.members;
        if (decision === "ACCEPTED") {
          members.push(invitedMemberElement);
        }

        const hackerDocRef = documentRef("Hackers", req.user.sub);
        const hackerDoc = (await t.get(hackerDocRef)).data();
        let invitations = hackerDoc.invitations;

        newInvitations = invitations.filter((element) => element.teamName !== teamName);

        let team = {};

        if (decision === "ACCEPTED") {
          team = {
            teamName: teamName,
            teamLeader: teamLeader,
          };
        }

        t.update(hackerDocRef, { invitations: newInvitations, team: team });
        t.update(teamDocRef, { invitedMembers: newInvitedMembers, members: members });
      } catch (err) {
        throw new Error(err);
      }
    });
    if (decision === "ACCEPTED") {
      const teamDoc = (await queryDocument("Teams", teamName)).data();
      const teamData = {
        teamLeader: teamDoc.teamLeader,
        members: teamDoc.members,
        invitedTeamMembers: teamDoc.invitedMembers,
      };

      res
        .status(200)
        .send({ status: 200, message: "Invitation Accepted", teamData: teamData, newInvitations: newInvitations });
    } else {
      res.status(200).send({ status: 200, message: "Invitation Declined", newInvitations: newInvitations });
    }
  } catch (err) {
    res.status(500).send({ status: 500, message: "Could Not Accept Invitation" });
    console.log(err);
  }
});

teams.get("/teamProfile", jwtCheck, hasReadHacker, async (req, res) => {
  try {
    const userDoc = (await queryDocument("Hackers", req.user.sub)).data();
    const teamName = userDoc.team.teamName;
    const teamLeader = userDoc.team.teamLeader;
    let members = [];
    let invitedMembers = [];
    if (teamName) {
      const teamDoc = (await queryDocument("Teams", teamName)).data();
      members = teamDoc.members;
      invitedMembers = teamDoc.invitedMembers;
    }

    const teamProfile = {
      teamName: teamName,
      teamLeader: teamLeader,
      members: members,
      invitedMembers: invitedMembers,
      invitationMode: userDoc.invitationMode,
      invitations: userDoc.invitations,
    };
    res.status(200).send({ status: 200, ...teamProfile });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: 500, error: "Could Not Fetch Team" });
  }
});

teams.delete("/removeMember", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const teamMemberToRemove = req.body.teamMemberToRemove;
    const userDoc = (await queryDocument("Hackers", req.user.sub)).data();
    let newMembers = [];
    let newInvitedMembers = [];
    if (userDoc.team.teamLeader === teamMemberToRemove) {
      res.status(500).send({ status: 500, error: "Cannot remove yourself from your own team" });
      return;
    }

    if (userDoc.team.teamLeader !== req.user.sub) {
      res.status(500).send({ status: 500, error: "Only the team leader can remove members" });
      return;
    }
    const teamName = userDoc.team.teamName;

    await dbTransaction(async (t) => {
      const teamDocRef = documentRef("Teams", teamName);
      const removeUserRef = documentRef("Hackers", teamMemberToRemove);
      const removedUserDoc = (await t.get(removeUserRef)).data();
      const teamDoc = (await t.get(teamDocRef)).data();

      newMembers = teamDoc.members.filter((element) => element.memberID !== teamMemberToRemove);
      newInvitedMembers = teamDoc.invitedMembers.filter((element) => element.memberID !== teamMemberToRemove);

      newRemovedUserInvitations = removedUserDoc.invitations.filter((element) => element.teamName !== teamName);
      t.update(removeUserRef, { invitations: newRemovedUserInvitations });
      t.update(teamDocRef, { members: newMembers, invitedMembers: newInvitedMembers });
    });

    await updateDocument("Hackers", teamMemberToRemove, { team: {} });

    res.status(200).send({
      status: 200,
      message: "Removed Hacker from team",
      newMembers: newMembers,
      newInvitedMembers: newInvitedMembers,
    });
  } catch (err) {
    functions.logger.error(err);
    res.status(500).send({ status: 500, error: "Cannot Remove Hacker" });
  }
});

teams.delete("/deleteTeam", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    await dbTransaction(async (t) => {
      try {
        const teamDocRef = documentRef("Teams", req.body.teamName);
        const teamDoc = (await t.get(teamDocRef)).data();
        if (teamDoc.members.length > 1) {
          throw new Error("Must Remove Member");
        }
        if (req.user.sub !== teamDoc.teamLeader) {
          throw new Error("Unauthorized");
        }
        const teamLeaderDocRef = documentRef("Hackers", teamDoc.teamLeader);

        t.update(teamLeaderDocRef, { team: {} });
        t.delete(teamDocRef);
      } catch (err) {
        throw new Error(err);
      }
    });
    res.status(200).send({ status: 200, message: `${req.body.teamName} Was Deleted` });
  } catch (err) {
    if (err === "Must Remove Member") {
      res.status(500).send({ status: 500, error: "You Must Remove All Members Before Deleting Your Team" });
      return;
    } else if (err === "Unauthorized") {
      res.status(500).send({ status: 500, error: "Only The Team Leader Can Delete A Team" });
      return;
    }
    res.status(500).send({ status: 500, error: "Cannot Delete Team" });
  }
});

const service = functions.https.onRequest(teams);

module.exports = { teams, service };
