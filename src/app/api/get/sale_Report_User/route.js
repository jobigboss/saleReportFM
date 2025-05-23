//api/get/sale_Report_User/route.js
import { connectMongoDB  } from '../../../../../lib/mongodb';
import sale_Report_User from '../../../../../models/sale_Report_User';
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectMongoDB ();
        const storeData = await sale_Report_User.find({}); // เปลี่ยนชื่อ local variable
        console.log("Fetched sale_Report_User:", storeData);
        return NextResponse.json(storeData);
    } catch (error) {
        console.error("Error fetching sale_Report_User:", error);
        return NextResponse.json({ message: "Error fetching sale_Report_User", error }, { status: 500 });
    }
}