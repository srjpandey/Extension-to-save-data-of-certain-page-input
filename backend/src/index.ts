import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDb } from "./utils/db";
import cors from "cors";
import { policyModel } from "./models/policy";
import morgan from "morgan";
import { AuthService } from "./services/AuthServices";

dotenv.config();
const express = require("express");
const app = express();

app.use(cors());

const port = process.env.port || 5000;
const dbUri = process.env.MONGO_URI; // Replace with your MongoDB connection string

connectDb(dbUri || "");
app.use(express.json());
app.use(morgan("common"));

app.use((req: Request, res: Request, next: NextFunction) => {
  // console.log(req.body);
  // console.log(req.headers);
  // console.log(req.path);
  // console.log(req.method);
  console.log("request *************************")
  console.log("request body *********************" , req.body)
  next();
});

type InputData = {
  target: {
    id:string;
    name: string;
    typedValue: string;
  };
  url: string;
};

app.post("/policy", async (req: Request, res: Response) => {
  const { data, user_id , tab_id } = req.body;
  let reqBody: InputData[];
  try {
    if (!req.body?.token) {
      throw "Failed to create policy data . Token not found."
      
    }
    let filtered_data = {} as Record<string, string>


    reqBody = JSON.parse(data);

    if(!tab_id){
      throw "Tab is is required"
    }
    if(!reqBody || reqBody.length === 0){
      throw "Data is required" + reqBody
    }

    console.log("data",reqBody)
    // filtered_data = reqBody.map((input) => {
    //   return {
    //     [input.target.name]: input.target.typedValue,
    //   };
    // });

    filtered_data = reqBody.reduce((obj,input)=>{
      const properties = input.target.name || input.target.id
      if(!obj[properties]){
        obj[properties] = input.target.typedValue
      }
      return obj;
    },{} as Record<string,string>)

    const user_email = await AuthService.decodeToken(req.body.token);

    if (!user_email) {
      throw "Failed to generate user token from token";
    }

    const policyExist = await policyModel.findOne({
      tab_id
    });

    if(policyExist){
      // update here

      // const updated_data = policyExist.data
      const updatedData = Object.assign({},policyExist.data, filtered_data);

      await policyModel.updateOne({
        tab_id
      },{

        data:updatedData
      })
      
    }else{
      await policyModel.create({
        data: filtered_data,
        user_id,
  
        provider_link: reqBody[0].url,
        user_email: user_email || "",
        tab_id
      });
    }

    res.status(200).json({ message: "policy data saved succesfully" });
 
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: "failed to save policy data" });
  }
});

app.post("/add-user", async (req: Request, res: Response) => {
  console.log("Adding user", req.body)
  const { email } = req.body.data || {};
  try {
    if (!email) {
      throw "Email is required";
    }




    const token = await AuthService.genereateToken(email);
    console.log("the token")
    res.status(201).json({ message: token });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
});




// Start the server
app.listen(4000, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
