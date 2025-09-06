//  Model for MongoDB

//	For reading Database URI from a file on the server
import fs from 'fs';

//  For connecting to mongodb
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

class Model {
    constructor() {
        console.log("Initializing model...");
        try {
            this.setupDatabase();
        } catch (error) {
            console.error(error);
        }
        console.log("Done initializing model.");
    }

    async setupDatabase() {
        //  Setup MongoDB client

        //  Read URI from file on server for security
        let uri = fs.readFileSync("/var/www/gilkeidar.com/public_html/node_api/models/db_uri.txt").toString();

        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        //  Connect the client
        await this.client.connect();

        await this.client.db("admin").command({ ping: 1});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //  List databases
        let dataBasesList = await this.client.db().admin().listDatabases();
        console.log("Databases:");
        dataBasesList.databases.forEach(db => console.log(` - ${db.name}`));

        this.database = this.client.db("user-data");

        // this.user_sessions = this.database.collection('user-sessions');

        // this.activity_bursts = this.database.collection('activity-bursts');
    }

    async getAll(tableName) {
        // return this.jsonDB[tableName];

        let result = [];

        const cursor = this.database.collection(tableName).find({});

        for await (const doc of cursor) {
            result.push(doc);
        }

        return result;

        // return {};
    }

    async getOne(tableName, criteria) {
        // for (let entry of this.jsonDB[tableName]) {
        //     if (entry.id == id) {
        //         console.log("Found entry!");
        //         return entry;
        //     }
        // }

        return await this.database.collection(tableName).findOne(criteria);
    }

    async getMany(tableName, criteria) {
        return await this.database.collection(tableName).find(criteria).toArray();
    }

    async createOne(tableName, object) {
        let result = {acknowledged: false};
        try {
            result = 
                await this.database.collection(tableName).insertOne(object);
        } catch (error) {
            console.error(error);
        }

        return result;
    }

    //  For "PUT"
    async replaceOne(tableName, id, newObject) {
        let result = {acknowledged: false};
        try {
            result = await this.database.collection(tableName)
                        .replaceOne({_id: id}, newObject);
        } catch (error) {
            console.error(error);
        }

        return result;
    }

    //  For "DELETE"
    async deleteOne(tableName, id) {
        let result = {acknowledged: false};
        try {
            result = await this.database.collection(tableName)
                        .deleteOne({_id: id});
        } catch (error) {
            console.error(error);
        }

        return result;
    }

    //  For "PATCH"
    async updateOne(tableName, id, newObject) {
        let result = {acknowledged: false};
        try {
            result = await this.database.collection(tableName)
                .updateOne({_id: id}, {$set: newObject});
        } catch (error) {
            console.error(error);
        }
        
        return result;
    }

    convertStringToObjectID(objectIDString) {
        return ObjectId.createFromHexString(objectIDString);
    }
}

export default Model;