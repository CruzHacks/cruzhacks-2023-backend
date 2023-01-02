const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateHacker, hasReadHacker } = require("../../utils/middleware");
const { db, setDocument, queryDocument, updateDocument } = require("../../utils/database");

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
      res.status(500).send({ status: 500, message: "Invalid Invitation Mode" });
      return;
    }

    if (userDoc.team.teamLeader) {
      res.status(500).send({ status: 500, message: "User has Team" });
      return;
    }

    if (checkNameDoc.exists) {
      functions.logger.log(`Error Creating Team: ${teamName},\nError: Team Name Taken`);
      res.status(500).send({ status: 500, message: "Team Name Taken" });
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
    };

    await setDocument("Teams", teamName, teamDoc);

    let team = {
      teamLeader: teamLeader,
      teamName: teamName,
    };

    await updateDocument("Hackers", req.user.sub, { team: team });

    let membersRes = [{ position: 0, name: teamDoc.members[0].memberName, id: teamDoc.members[0].memberID }];

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

    if (teamDoc.members.length >= 5) {
      res.status(500).send({ status: 500, error: "You Have Invited The Max Number of Hackers" });
      return;
    }

    const reverseSearchDoc = (await queryDocument("Searches", "auth0IDSearch")).data();
    const invitedMemberAuth0ID = reverseSearchDoc.emailSearch[invitedMemberEmail];

    await db.runTransaction(async (t) => {
      const invitedMemberDocRef = db.collection("Hackers").doc(invitedMemberAuth0ID);
      const doc = (await t.get(invitedMemberDocRef)).data();
      let invitations = doc.invitations;
      invitations.push({ teamName: teamName, status: "PENDING" });
      t.update(invitedMemberDocRef, { invitations: invitations });
    });

    res.status(200).send({ status: 200, memberEmail: invitedMemberAuth0ID });
  } catch (err) {
    functions.logger.log(`Could Not Invite ${req.body.invitedMember}\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Unable to Invite" });
  }
});

teams.get("/teamProfile", jwtCheck, hasReadHacker, async (req, res) => {
  try {
    const userDoc = (await queryDocument("Hackers", req.user.sub)).data();
    const teamName = userDoc.team.teamName;
    const teamLeader = userDoc.team.teamLeader;
    let members = [];
    if (teamName) {
      const teamDoc = (await queryDocument("Teams", teamName)).data();
      for (let i = 0; i < teamDoc.members.length; i++) {
        members.push({ position: i, name: teamDoc.members[i].memberName });
      }
    }

    const teamProfile = {
      teamName: teamName,
      teamLeader: teamLeader,
      members: members,
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

    if (userDoc.team.teamLeader === teamMemberToRemove) {
      res.status(500).send({ status: 500, error: "Cannot remove yourself from your own team" });
      return;
    }

    if (userDoc.team.teamLeader !== req.user.sub) {
      res.status(500).send({ status: 500, error: "Only the team leader can remove members" });
      return;
    }
    const teamName = userDoc.team.teamName;

    await db.runTransaction(async (t) => {
      const teamDocRef = db.collection("Teams").doc(teamName);
      const newMembers = teamDoc.members.filter((element) => element.memberID !== teamMemberToRemove);
      t.update(teamDocRef, { members: newMembers });
    });

    await updateDocument("Hackers", teamMemberToRemove, { team: {} });

    res.status(200).send({ status: 200, message: "Removed Hacker from team" });
  } catch (err) {
    res.status(500).send({ status: 500, error: "Cannot remove Hacker" });
  }
});

const service = functions.https.onRequest(teams);

module.exports = { teams, service };
