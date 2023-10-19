import { service as authService } from "../controllers/auth/index";
import { service as verifyRecaptchaService } from "../controllers/VerifyRecaptcha/index";
import { service as announcementsService } from "../controllers/announcements-api/index";
import { service as applicantsService } from "../controllers/applicants/index";
import { service as applicationService } from "../controllers/application/index";
import { service as analyticsService } from "../controllers/analytics/index";
import { service as writeToAnalyticService } from "../controllers/analytics/index";
import { service as hackerService } from "../controllers/hacker/index";
import { service as adminService } from "../controllers/admin/index";
import { service as cruzpointsService } from "../controllers/cruzpoints/index";
import { service as teamsService } from "../controllers/teams/index";
import { service as notifyService } from "../controllers/notify/index";

const auth = authService;
const verifyRecaptcha = verifyRecaptchaService;
const announcements = announcementsService;
const applicants = applicantsService;
const application = applicationService;
const analytics = analyticsService;
const writeToAnalytics = writeToAnalyticService;
const hacker = hackerService;
const admin = adminService;
const cruzpoints = cruzpointsService;
const teams = teamsService;
const notify = notifyService;

export {
  auth,
  verifyRecaptcha,
  announcements,
  applicants,
  application,
  analytics,
  writeToAnalytics,
  hacker,
  admin,
  cruzpoints,
  teams,
  notify,
};
