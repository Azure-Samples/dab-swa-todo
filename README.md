# Jamstack Todo App with Azure Static Web Apps, Data API Builder and Azure SQL Database

Fork the repository and clone it to your local machine.

## Local development

Make sure you have the .NET Core 6, Node 16 and Static Web Apps CLI installed.

Deploy the database project to an SQL Server or Azure SQL Emulator instance using VS Code Database Projects extension or manually using the `sqlpackage` tool.

Once database has been deployed, build the Vue fronted via

```shell
swa build
```

then create an `.env` file in the root folder, and the `AZURE_SQL` environment variable to set it to the connection string pointing to the local SQL Server instance or Azure SQL Emulator:

```shell
AZURE_SQL='Server=localhost;Database=TodoDB;User ID=<username>;Password=<password>;TrustServerCertificate=true;'
```

then execute the repository locally using the following command:

```shell
swa start
```

## Deploy to Azure

Make sure you have the AZ CLI installed.

### Setup the Static Web App resource

Create a new Static Web App using the following command:

```shell
az staticwebapp create -n <name> -g <resource-group>
```

once it has been created, get the Static Web App deployment token:

```shell
az staticwebapp secrets list --name <name> --query "properties.apiKey" -o tsv
```

Take the token and add it to the repository secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`.

### Get the connection string to Azure SQL DB

Create a new Azure SQL Server if you don't have one already: 

```shell
az sql server create -n <server-name> -g <resource-group> -l <location> --admin-user <admin-user> --admin-password <admin-password>
```

and set yourself as the AD admin. To do that get your user object id:

```shell
az ad signed-in-user show --query objectId -o tsv
```

and get the display name:

```shell
az ad signed-in-user show --query displayName -o tsv
```

The create the AD admin in Azure SQL server:

```shell
az sql server ad-admin create --display-name <display-name> --object-id <object-id> --server <server-name> -g <resource-group>
```

Get the connection string (no worries if the TodoDB database doesn't exist yet, it will be created later automatically):

```shell 
az sql db show-connection-string -s <server-name> -n TodoDB -c ado.net
```

Replace the `<username>` and `<password>` in the connection string with those for a user that can perform DDL (create/alter/drop) operations on the database, and then create a new secret in the repository called `AZURE_SQL_CONNECTION_STRING` with the value of the connection string.

### Push the repository to GitHub

Push the repo to GitHub to kick off the deployment.

### Configure the Static Web App Database Connection

Once the deployment has completed, navigate to the Static Web App resource in the Azure Portal and click on the *Database connection (preview)* item under *Settings*. Click on *Link existing database* to connect to the Azure SQL server and the TodoDB that was created by the deployment.

## Done!

Use your browser to navigate to the Static Web App URL and start using the app.