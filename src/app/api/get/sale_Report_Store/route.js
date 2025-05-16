//api/get/sale_Report_Store/route.js
import { connectMongoDB  } from '../../../../../lib/mongodb';
import sale_Report_Store from '../../../../../models/sale_Report_Store';
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectMongoDB ();
        const storeData = await sale_Report_Store.find({}); // เปลี่ยนชื่อ local variable
        console.log("Fetched sale_Report_Store:", storeData);
        return NextResponse.json(storeData);
    } catch (error) {
        console.error("Error fetching sale_Report_Store:", error);
        return NextResponse.json({ message: "Error fetching sale_Report_Store", error }, { status: 500 });
    }
}