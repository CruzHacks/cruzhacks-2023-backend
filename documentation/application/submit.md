# CruzHacks Application Service

This Firebase Function is responsible for CruzHacks application.  This service uses Cloud Firestore and Cloud Storage. 

## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/application/submit \
  --header 'authorization: Bearer AUTH_TOKEN' \
  --header 'content-type: multipart/form-data' \
  --data `fname: <First Name>`
  --data `lname: <Last Name>`
  --data `email: <Email>`
  --data `phone: <Phone Number>`
  --data `age: <age>`
  --data `pronounCount: <Number of Pronouns Listed>`
  --data `pronouns[0-N-1]: <Pronouns>`
  --data `sexualityCount: <Number of Sexuality Preferences Listed>`
  --data `sexuality[0-N-1]: <Sexuality>`
  --data `school: <School : ucsc/UC Santa Cruz, university of california, santa cruz>`
  --data `collegeAffiliation: <Given List | Empty if:non-ucsc>`
  --data `eventLocation: <Given List>`
  --data `major: <Major>`
  --data `currentStanding: <currentStanding>`
  --data `country: <country>`
  --data `whyCruzHacks: <Response to Question>`
  --data `newThisYear: <Reponse to Question>`
  --data `grandestInvention: <Response to Question>`
  --data `firstCruzHack: <"yes" | "no">`
  --data `hackathonCount: <Number>`
  --data `priorExperience: <Response | Empty>`
  --data `linkedin: <Response | Empty>`
  --data `github: <Response | Empty>`
  --data `cruzCoins: <Response | Empty>`
  --data `anythingElse: <Reponse | Empty>`
```

## Response Schemas

### Successfully Submitted Application

```json
{
  "code": 201,
  "message": "Successfully Updated Application"
}
```


### Form Validation Error

```json
{
  "code": 400,
  "message": "Form Validation Failed",
  "errors": ["Array of Error Messages"]
}
```

### Resume Validation Error

```json
{
  "code": 400,
  "message": "Resume Validation Failed",
  "errors": ["Array of Resume Error Messages"]
}
```


### Resume Uplaod Error

```json
{
  "code": 400,
  "message": "An Error Occurred Uploading Your Resume"
}
```

### Server Error

```json
{
  "code": 500,
  "message": "Item Added Successfully"
}
```