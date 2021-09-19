# CruzHacks Delete Announcement Service (In Progress)*

This Firebase Function is responsible for deleting any announcements. This service uses Cloud Firestore.


## Request Schema

```shell
curl --request DELETE \
  --url http://localhost:5001/<project>/<timezone>/announcement \
  --header 'authentication: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Deleted Announcements


