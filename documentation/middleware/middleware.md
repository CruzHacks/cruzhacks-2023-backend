# CruzHacks Middleware

The Following Responses may occur if middleware is not satisfied.


## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/<endpoint> \
  --header 'authentication: API_KEY' \
  --header 'token: CLIENT_TOKEN' \
  --header 'content-type: application/json' \
```

## Error Response Schemas

### CORS

```json
{
  "status": 403,
  "message": "Forbidden"
}
```

### Invalid JWT
```json
{
  "status": 401,
  "message": "Unauthorized Access"
}
```

### Insufficient Permissions

```json
{
  "status": 403,
  "message": "Invalid Permissions"
}
```

### Invalid Client API Key
```json 
{
  "status": 401,
  "message": "Invalid Api Key"
}
```

