# CruzHacks Add Announcement Service (In Progress)*

This Firebase Function is responsible for adding any announcements. This service uses Cloud Firestore.


## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/announcements \
  --header 'authentication: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Added Announcements


