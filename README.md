# Google Drive Watcher

## System Requirements

In order run the project you must have the following installed on your computer:

- node.js
- yarn

## Run Instructions

1. Before starting the run instructions, make sure you install the system requirements in the section above
2. Clone the codebase from the github repository located at: https://github.com/laronson/drive-watcher
3. Using your command-line, navigate to the root of the project and run `yarn install` to install the project’s javascript dependencies
4. Create a `.env` file at the root of the project. You can copy the required environment variable names from the `.env.local` file. I did not have time to set up a proper secrets manager so I will be sending you a separate encrypted file with all the secrets required to run the project separately.
5. Create a `.google-auth-confog.json` file at the root of your project. This contains the configurations to enable your code to connect to the Google service account which has access to the google drive folder used for the project. The contents of this file is also sensitive so you will receive it in an encrypted file separately as well.
6. Run `yarn build` to run the typescript compiler on the typescript codebase. This will put all javascript assets used to run non-development version of the project in the /build folder. This command also moves the `.env` file you created in step 4 into a location that the javascript code can access.
7. Run `yarn start` to run the project.

## Usage Instructions & Description of Functionality

The application has two core pieces of functionality:

- Watching a google drive folder located for any changes in permissions or for any deleted folders. The drive folder can be located here: [https://drive.google.com/drive/folders/1zUXaigiqFEWn07aTFeQN-64NKaFXg9fR](https://drive.google.com/drive/folders/1zUXaigiqFEWn07aTFeQN-64NKaFXg9fR). The folder is publicly accessible so you should be able to use it in order to use it in order to interact with the application when it is running
- Downloading files from the google drive.

### Watching the Google Drive Folder

The core purpose of the application is to watch changes that occur within folder within a Google drive. The application displays these changes using a in a grid within the command line.

The application is able to watch the google drive folder for four different change types:

- add - A user permission is added to a file within the folder
- remove - A user permission is removed from a file within the folder
- update - A user’s permission is changed for a file within the folder
- trash - A file is deleted from the folder

Every time a change is made to a file within the folder that is accessible to the service account linked to the project server, Google fires a request which connects to the application server and triggers a change within the UI. Because the application is running locally, `ngrok` is used to connect the locally running application to the internet. Google is configured to hit a publicly accessible endpoint hosted by `ngrok` which is then forwarded to the local server so it can react to the change. When a change is received by the application, the server interprets the change to and, if nessiary, reacts to the change in order to update the UI to mimic the current state of the Google drive.

### Downloading Files from the Google Drive

The application exposes and endpoint to allow users to download any of the file accessible to the application server. In order to this, the user can take the ID of the files displayed within the command line interface and pass that ID as a parameter to the download post endpoint. Currently, the application is capable of downloading two types of files:

- Google Docs which are downloaded as .txt files
- Google Sheets which are downloaded as .csv files

The download will appear in the `/downloads` folder at the root of the project. This folder is created when the application starts so you may not notice it until you start the application.

The route can be hit at the following url using the file’s google drive file ID as a query parameter:

```jsx
[POST] localhost:8080/download/:fileID
```

When a download is triggered, the application will also update the UI to alert the user that their download has started using the _downloading_ status and it will also alert the user that their download has finished using the _download complete_ status.

To perform the download, the application first calls the google drive API file.export() function to receive a Readable bytestream for the file that is to be downloaded. A file write stream is then created that points to the file that is to be created and hold the contents of the download named after the filename as it sits in the Google drive. The contents of the download stream are then pipped to the writeStream. Once the download is complete, the application updates the UI to reflect that the download has completed.

## Codebase Description

The application code is split into four main layers:

- The server (located in `/server`) - This houses the express server and all of the server’s routes. It is also responsible for acting as the entry point to the server. For the most part, this component acts as the skeleton for the application and outsources all of the functionality it relies on the the application’s services.
- The services (located in `/services`) - The services is where most of application’s functionality lives. This layer is responsible for acting as the connective tissue between all other layers of the application in that it is responsible for taking orders from the server layer, retrieving data from the repository layer, and piping data to the ui layer. There are four main services:
  - DownloadFileService - This service is responsible for managing downloads triggered by the `/download` route.
  - FileChangeService - This service is responsible for managing what should occur when a change occurs within the google drive and an event is received by Google via the open webhook described in the **Functionality Description** section.
  - GoogleDriveService - This service is responsible for interacting with Google Drive via the google drive javascript SDK.
  - LoggingService - This service is responsible for all logging throughout the application. A broader description of why this service is necessary can be found in the **Logging** section below.
- The Repository (located in `/repository`) - This layer is used as a local database to store information about files received by the GoogleDriveService. Because we store data in this layer, it allows us to reduce our dependence on making requests to the Google Drive SDK which in turn will increase speed and efficiency.
- The UI Layer (located in `/ui`) - This layer is used to manage all updates to the command line table in order to reflect the most up-to-date state of the google drive. This layer takes direction from the service layer in order to know when and how to update the UI.

## Developer Experience

In order to improve experience of any developers who may work on this project in the future, the following frameworks were added to the project:

- Eslint - This gives developers a guide by which they can follow established codebase patterns.
- Prettier - This gives developers a consistent style guid by which they can style their code.
- Typescript - Although this one can be somewhat divisive, I think, in some cases, Typescript and the type safety it provides can act as a nice guide rail for developers when using Javascript. However, as you can see in the **Future Enhancements** section below, it does have some pitfalls, and if speed is of the essence, some corners may need to be cut in how we type our code which reduces the helpfulness of Typescript.

Aside from these three components, I tried to stick to a consistent codebase architecture (described in the **Codebase Description** section above) in order to give future developers patterns to follow when adding the codebase. Using the four distinct layers in the codebase, I hope to establish a clear divide and separation of responsibilities for each layer of the codebase so future developer can have an understanding of where they should put their code.

## Logging

Because the standard output of the project is taken up by the table displaying changes within the Google drive, application logs are printed to a separate file so they are preserved and viewable. If you wish to view the application logs, they are located in the `/log` folder. This folder is created when the application starts so you may not notice it until you start the application. Each time the application starts, a new log file is created with the format `log-${Date.toISOString()}`.

## Future Enhancements

- TESTING! There are not automated tests in this project and if this project were to go into production, it would be a requirement that we added at least a few e2e tests before release.
- The use of a secrets manager to house sensitive configurations. I would typically use this type of tool in parts of the application release process.
- The use of a heavier backend framework like Nest.js. Aside from providing actual dependency injection (instead of using the singleton pattern for my classes) these frameworks provide a lot of helpful tools for organizing the codebase and extra “out of the box” functionality that would be helpful.
- Adding last Updated Time to the command line time which updates every time a file is updated.
- Improving type safety of the codebase. There were a few locations where I needed to use the `as` keyword to get around some of the lack of up-to-date types provided by the javascript frameworks I used. Further, the mapping done in the `GoogleDriveService` does not do much in protecting against bad incoming data as I have set defaults for those types.
- Error Handling could be improved to better track specific kinds of errors instead of throwing generic errors when an error occurs.
- Better management of webhook connections with a proper shutdown process.
