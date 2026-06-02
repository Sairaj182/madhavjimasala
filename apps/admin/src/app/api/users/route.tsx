import {NextResponse} from "next/server";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request){
    try{

        const body = await req.json();
            
        const {name,email,password,role} = body;

        if(!name || !email || !password){
            return NextResponse.json({message: "Missing: name || email || password"}, {status: 400});
        }
        
        const existingUser = await prisma.user.findUnique({
            where: {email:email}
        });

        if(existingUser){
            return NextResponse.json(
                {
                    success: false,
                    message: "User with this id already exists"
                },
                {status: 409}
            )
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword,
                role: role || "admin",
            },
        });
        
        return NextResponse.json(
            {
                success:true,
                data: user,
                message: "User created successfully"
            },
            {status: 201}
        );
    } catch(error) {
        return NextResponse.json(
            {
                success:false,
                message: "Failed to create user",
                error: error
            },
            {status: 500}
        );
    }
}