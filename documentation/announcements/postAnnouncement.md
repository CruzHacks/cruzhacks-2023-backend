# CruzHacks Add Announcement Service

This Firebase Function is responsible for adding any announcements. This service uses Cloud Firestore. 

## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/announcements \
  --header 'authorization: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
  -- data ' {
      title: "Some annnouncement Title",
      message: "Some message"
  }'
```
* Title must be 1-50 characters and alphanumeric
* Message must be 1-200 characters and alphanumeric

## Response Schemas

### Successfully Added Announcement

```json
{
  "error": false,
  "status": 201,
  "message": "Item Added Successfully"
}
```

### Invalid Message, Missing Message, Message too Long

```json
{
  "error": false,
  "status": 201,
  "message": "Invalid Message"
}
```

### Invalid Title, Missing Title, Title too Long

```json
{
  "error": true,
  "status": 201,
  "message": "Invalid Title"
}
```

### Internal Server Error

```json
{
  "error": true,
  "status": 500,
  "message": "Internal Server Error"
}
```




