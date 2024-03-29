# Plutchik API & Telegram bot
There are three possible options of usage:
- For any users by [Telegram bot](#https://t.me/plutchik_bot)
- For psychologists try [Telegram bot](#https://t.me/plutchik_bot) or web application
- API for dating sevices based on studies of Robert Plutchik. 


About methodology [See Wikipedia about R.Plutchik studies](#https://en.wikipedia.org/wiki/Robert_Plutchik)
## Introduction

![<img width="10px"/>](https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Plutchik-wheel.svg/300px-Plutchik-wheel.svg.png)

## How to get started
As user
1. Find [Telegram bot](#https://t.me/plutchik_bot)
2. Send command /start to bot
3. Change your settings. Choose right language to get appropriate content
4. Try Insights button to get your features

As psychologist
1. Find [Telegram bot](#https://t.me/plutchik_bot)
2. Send command /start to bot
3. Use web application to create new organizations
4. Manage content of your organization. Invite other users to manage content of your organizations
5. Assign groups to users for assessments
6. Collect and analyze results

[See roles description](#roles). 

## How to add content

Use methods [addcontent](#addcontent-method) to add new items and change existing items in collection. Methods [blockcontent](#blockcontent-method) and [unblockcontent](#unblockcontent-method) make items visible or hiding from users.

For editing content item structure use [Content](#content-object) object.

For editing content items you must have organizationkey with create_content role. Users can't create or edit content items. They can assess them only. Organizations can create and edit content. 


## How to add assesment by users
Use [addassessment](#addassessment-method) method to create new assessment had done by user. For calling `addassessment` you must reveal sessiontoken by [getsessiontoken](#getsessiontoken-method) method and use sesstiontoken as parameter.

Use [Assessment](#assessment-object) object to create new assessment as a parameter for [addassessment](#addassessment-method) method.
<!---
## How to get matches

## How to discover new users from other dating services or psycology teams
--->
## Why it's free for dating services
Breifly. 'Cause data are using by psychology teams for their studies.

## Authorization schemas
There are two authorization schemas: 
- for organizations: API is awaiting the pair of organizationid and organizationkey
- for users: API is awaiting the pair of userid and valid sessiontoken

## Roles

|Role|Description|Admitted methods|
|---|---|-|
|`superviser`|Organization is having this role can do everything| All|
|`administrator`|Role admits to manage keys to reveal new keys|[addorganizationkey](#addorganizationkey-method), [removeorganizationkey](), [listorganizationkeys]()|
|`manage_users`|Role admits to create new users, edit exist ones, block and unblock|[adduser](#adduser-method), [blockuser](#blockuser-method), [unblockuser](#unblockuser-method)|
|`manage_content`|Role admits to create new content items, edit exist ones, block and unblock|[addcontent](#addcontent-method), [blockcontent](#blockcontent-method), [unblockcontent](#unblockcontent-method)|
|`mining_session`|Role admits to create sessions tokens for user|[getsessiontoken](#getsessiontoken-method)|
|`create_assessment`|Role admits to create new assesments|[addassessment](#addassessment-method)|
|`getting_feed`|Role admits getting the next content item to assessment|Not implemented yet|
|`getting_match`|Role admits to get matches|Not implemented yet|

## API

|object|Description|
|---|---|
|[Organization](#organization-object)| Organization can create users, content items. Organization provides roles for users|
|[User](#user-object)| User who can evaluate content and get matched with other users|
|[Content](#content-object)| Item (unit) for evaluation by user in Plutchik's wheel|
|[Assessment](#assessment-object)| Assessment (evaluation) by user of content item in Plutchik's wheel|


|method|Description|
|---|-|
|[version](#version)| Gets version Plutchik API|
|📁 **ORGANIZATION management**|
|[addorganizationkey](#addorganizationkey-method)| Adds new organization key with exact roles|
|[listorganizationkeys](#organizationkeyslist-method)| Returns list of organization keys with their roles|
|[removeorganizationkey](#removeorganizationkey-method)| Removes the organization key|
|[organizationinfo](#organizationinfo-method)| Check the pair of organization id and key and returns common organization's info|
|📁 **USER management**|
|[adduser](#adduser-method)| Adds new user|
|[getsessiontoken](#getsessiontoken-method)| Gets session token for user|
|[blockuser](#blockuser-method)| Block user|
|[unblockuser](#unblockuser-method)| Unblock user|
|📁 **CONTENT management**|
|[addcontent](#addcontent-method)| Adds new content item|
|[blockcontent](#blockcontent-method)| Block content item|
|[unblockcontent](#unblockcontent-method)| Unblock content item|
|📁 **ASSESSMENT management**|
|[addassessment](#addassessment-method)| Adds new assessment|

---
* ### **`Organization` object**
```
export interface IOrganization {
    _id: Types.ObjectId;
    name: string | IMLString;
    keys: Array<{
        roles: Array<string>;
        keyname: string;
        expired: Date;
        created: Date;
        keyhash: string;
    }>;
    created: Date;
    changed: Date;
}
```
[Back to API 👆](#api)

---
* ### **`User` object**
```
interface IUser {
    _id: Types.ObjectId;
    organizationid: Types.ObjectId;
    birthdate: Date;
    nativelanguage: string;
    secondlanguages: Array<string>,
    location: string;
    gender: string;
    maritalstatus: string;
    features: string;
    blocked: boolean;
    created: Date;
    changed: Date;
}    
```
[Back to API 👆](#api)

---
* ### **`Content` object**
```
export interface IContent {
    _uid: Types.ObjectId;
    type: ContentTypes;
    url: string;
    name: string;
    description: string;
    language: string;
    restrictions: Array<string>;
    organizationidref?: Types.ObjectId;
    foruseronlyidref?: Types.ObjectId;
    blocked: boolean;
    created: Date;
    changed: Date;
}
```
[Back to API 👆](#api)

---
* ### **`Assessment` object**
```
export interface IAssessment {
    _id?: Types.ObjectId; // uniq ID of assessment
    uid?: Types.ObjectId; // user ID, required but may be undefined. userid posted by security schema of call
    cid: Types.ObjectId; // content ID
    vector: {
        joy?: number;
        trust?: number;
        fear?: number;
        surprise?: number;
        disgust?: number;
        sadness?: number;
        anger?: number;
        anticipation?: number;
    },
    tags?: Array<string>; // tags from user
    rating?: number; // value of assessed content item for match with others
    created?: Date;
}
```
[Back to API 👆](#api)

---
* ### **`version`** method
    Description: returns object with values of versions: api, data, ai
    
    Method: `GET`

    Parameters: `NONE`

    Security schema: `NONE`

    Returns: 
    
    * object version {api: x.x.x, data: x.x.x, ai: x.x.x}
    * format application/json


    [Back to API 👆](#api)
---
* ### **`addorganizationkey`** method
    Description: creates the new key with exect roles. Organization must use key with administrator roles to create new key

    Method: `POST`

    Parameters:

    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with role [administrator](#roles)| MongoDB uuid | header | ✅
    |`name`|Name of a new key| string|body|✅
    |`roles`|Array of roles for a new key|Array of strings|body|✅

    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: 
    * format: `application/text`
    * data: mongoDB uuid of a new key

    Request example:
    ```
    POST http://localhost:8000/addorganizationkey
    Content-Type: application/json
    organizationid: 63c0e7dad80176886c22129d
    organizationkey: 63c2875ecb60f72dc1eb6bbb

    {
        "name": "David Rhuxel",
        "roles": ["manage_content", "manage_users"]
    }
    ```

    [Back to API 👆](#api)
---
* ### **`removeorganizationkey`** method
    Description: Deletes the key. Organization must use key with administrator roles to remove key

    Method: `POST`

    Parameters:

    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with role [administrator](#roles)| MongoDB uuid | header | ✅
    |`id`|Id returned by [organizationkeyslist](#removeorganizationkey-method) method. Can't delete key with id = 0| string|body|✅
    
    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: 
        NONE

    Request example:
    ```
    POST http://localhost:8000/removeorganizationkey
    Content-Type: application/json
    organizationid: 63c0e7dad80176886c22129d
    organizationkey: 63c2875ecb60f72dc1eb6bbb

    {
        "id": 1
    }
    ```

    [Back to API 👆](#api)
---
* ### **`organizationkeyslist`** method
    Description: Returns all organization keys

    Method: `GET`

    Parameters:

    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with role [administrator](#roles)| MongoDB uuid | header | ✅

    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: 
    * format: `application/json`
    * data: array of objects

    Request example:
    ```
    GET http://localhost:8000/organizationkeyslist
    Content-Type: application/json
    organizationid: 63c0e7dad80176886c22129d
    organizationkey: 63c2875ecb60f72dc1eb6bbb
    ```

    [Back to API 👆](#api)
---
* ### **`organizationinfo`** method
    Description: Check the pair of organization id and key and returns common organization's info

    Method: `GET`

    Parameters:

    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with role [administrator](#roles)| MongoDB uuid | header | ✅

    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: 
    * format: `application/json`
    * data: object
    ```
        {
            name: string - organization name,
            keyname: string - name of key
            keyroles: array of string - list of current roles
            keyscount: number - count of organization's keys
            userscount: number - count of organization's users
            contentcount: number - count of organization's content items
            assessmentscount: number - count of organization's user assessments
        }
    ```
    Request example:
    ```
    GET http://localhost:8000/organizationinfo
    Content-Type: application/json
    organizationid: 63c0e7dad80176886c22129d
    organizationkey: 63c2875ecb60f72dc1eb6bbb
    ```

    [Back to API 👆](#api)
---
* ### **`adduser`** method
    Description: creates user or updates existing user. Returns actual user information 
    
    Method: `POST`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with role [manage_users](#roles)| MongoDB uuid | header | ✅
    |`userid` | Uniq user id of user which info changed. Can be empty or absent, then new user will be created | MongoDB uuid | header|
    |`userinfo`||||✅|
    |`userinfo.birthdate`|User's birthdate|YYYY-mm-dd|body|
    |`userinfo.nativelanguage`|User's native language|string|body|
    |`userinfo.secondlanguages`|Other user's languages that can be used|Array of string|body|
    |`userinfo.location`|String as 'lat: xx.xxxxx, lng: yy.yyyyy' or 'Prague, Czech' etc. which describes user's location|string|body|
    |`userinfo.gender`|User's gender in his(her,...) opinion|string|body|
    |`userinfo.maritalstatus`| User's marital status in one's opinion| string|body|
    |`userinfo.features`|Any information about user|string|body|



    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: 
    * format: `application/json`
    * data: [User](#user-object) object

    Request example:
    ```
    POST http://localhost:8000/adduser
    Content-Type: application/json
    organizationid: 63c0e7dad80176886c22129d
    organizationkey: 63c2875ecb60f72dc1eb6bbb
    userid: 63c28926cb60f72dc1eb6bbf

    {
        "userinfo": {
            "birthdate": "1972-07-23",
            "nativelanguage": "English",
            "secondlanguages": ["French", "Ukrain"],
            "location": "Prague",
            "gender": "male",
            "maritalstatus": "single",
            "features": "extra",
            "blocked": "false"
        }
    }
    ```

    [Back to API 👆](#api)
---
* ### **`getsessiontoken`** method
    Description: returns session token for user 
    
    Method: `GET`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- |---|
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with exact roles| MongoDB uuid | header | ✅
    | `userid` | User which session token requsted for | MongoDB uuid | header|✅


    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey & PlutchikAuthUserId`

    Returns: 
    
    * text string MongoDB uuid 
    * format application/text

    [Back to API 👆](#api)
---
* ### **`blockuser`** method
    Description: Blocks user. After that user can't assess content and can't get matched
    
    Method: `GET`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- |---|
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with exact roles| MongoDB uuid | header | ✅
    | `userid` | User which session token requsted for | MongoDB uuid | header|✅


    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey & PlutchikAuthUserId`

    Returns: NONE

    [Back to API 👆](#api)
---
* ### **`unblockuser`** method
    Description: Unblocks user. After that user can assess content and can get matched
    
    Method: `GET`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- |---|
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with exact roles| MongoDB uuid | header | ✅
    | `userid` | User which session token requsted for | MongoDB uuid | header|✅


    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey & PlutchikAuthUserId`

    Returns: `NONE`

    [Back to API 👆](#api)
---
* ### **`addcontent`** method
    Description: creates content or updates existing content item. Returns actual content item 
    
    Method: `POST`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with exact roles| MongoDB uuid | header | ✅
    |`contentinfo`|||body|✅|
    |`contentinfo._id` | Uniq content item's id. It can be empty or absent, then new content item will be created | MongoDB uuid | body|
    |`contentinfo.type`|String one of values: text, audio, video, image, memes|string|body|✅|
    |`contentinfo.url`|URL located the content item|string|body|✅|
    |`contentinfo.name`|Name of content item|string|body|✅|
    |`contentinfo.tags`|User's native language|string|body|✅|
    |`contentinfo.description`|Description of content item|Array of string|body|✅|
    |`contentinfo.language`|language of content item|string|body|✅|
    |`contentinfo.restrictions`|Array of restrictions|Array of strings|body|
    |`contentinfo.blocked`| Blocked or unblocked content item| string: "true" or "false"|body|
    |`contentinfo.expired`|Date time after that content item will be hide from users|string RFC3339|body|
    |`contentinfo.validfrom`|Date time before that content item is hide from users|string RFC3339|body|



    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: 
    * format: `application/json`
    * data: [Content](#content-object) object

    Request example:
    ```
    POST http://localhost:8000/addcontent
    Content-Type: application/json
    organizationid: 63c0e7dad80176886c22129d
    organizationkey: 63c2875ecb60f72dc1eb6bbb

    {
        "contentinfo": {
            "type": "memes",
            "url": "https://i.ytimg.com/vi/NbpdFJrothU/maxresdefault.jpg",
            "name": "TH sound",
            "tags": [],
            "description": "When your teacher explains how to pronounce TH",
            "language": "English",
            "restrictions": [],
            "blocked": "false"
        }
    }
    ```

    [Back to API 👆](#api)
---
* ### **`blockcontent`** method
    Description: Blocks content item. After that users can't find and assess this content
    
    Method: `GET`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- |---|
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with exact roles| MongoDB uuid | header | ✅
    | `cid` | Content item's uniq id | MongoDB uuid | path|✅


    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: NONE

    [Back to API 👆](#api)
---
* ### **`unblockcontent`** method
    Description: Unblocks content item. After that user can find and assess this content item
    
    Method: `GET`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- |---|
    | `organizationid` | Uniq id of organization | MongoDB uuid | header |✅
    | `organizationkey`| Key recieved from Plutchik API with exact roles| MongoDB uuid | header | ✅
    | `cid` | Content item's uniq id | MongoDB uuid | path|✅


    Security schemas: 
    ` PlutchikAuthOrganizationId & PlutchikAuthOrganizationKey`

    Returns: `NONE`

    [Back to API 👆](#api)
---
* ### **`addassessment`** method
    Description: creates user's assessment of content item. Returns full object [Assessment](#assessment-object) as it's saved.
    
    Method: `POST`

    Parameters: 
        
    | Parameter | description | Format | Where |Mandatory|
    | --- | --- | --- | --- | --- |
    | `userid` | Uniq id user | MongoDB uuid | header |✅
    | `sessiontoken`| Active session token got by [getsessiontoken](#getsessiontoken-method)| MongoDB uuid | header | ✅
    |`assessmentinfo`||||✅|
    |`assessmentinfo.cid` | Uniq content id  | MongoDB uuid | body|✅|
    |`assessmentinfo.tags`|Array of tags from user with evaluation|Array of strings|body|
    |`assessmentinfo.rating`|Measure of confidence of user in his(her) assessment|number |body|
    |`assessmentinfo.vector`|Plutchik's wheel object|object|body|✅|
    |`assessmentinfo.vector.joy`|`joy` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.trust`|`trust` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.fear`|`fear` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.surprise`|`surprise` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.sadness`|`sadness` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.disgust`|`disgust` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.anger`|`anger` evaluation|float: 0 - 1|body|
    |`assessmentinfo.vector.anticipation`|`anticipation` evaluation|float: 0 - 1|body|

    Security schemas: 
    ` PlutchikAuthUserId & PlutchikAuthSessionToken`

    Returns: 
    * format: `application/json`
    * data: [Assessment](#assessment-object) object

    Request example:
    ```
    POST http://localhost:8000/addassessment
    Content-Type: application/json
    userid: 63c28926cb60f72dc1eb6bbf
    sessiontoken: $st.data

    {
        "assessmentinfo": {
            "cid": "63c83c56116ae4954bdc51ad",
            "vector": {
                "joy": 0.5,
                "trust": 0.6
            }
        }
    }
    ```

    [Back to API 👆](#api)
---

## References
1. [Wikipedia](#https://en.wikipedia.org/wiki/Robert_Plutchik) about R.Plutchik studies