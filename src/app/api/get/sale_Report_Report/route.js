// api/get/sale_Report_Report
import { connectMongoDB  } from '../../../../../lib/mongodb';
import sale_Report from '../../../../../models/sale_Report';
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectMongoDB ();
        const reportData = await sale_Report.find({}); // เปลี่ยนชื่อ local variable
        console.log("Fetched sale_Report:", reportData);
        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Error fetching sale_Report:", error);
        return NextResponse.json({ message: "Error fetching sale_Report", error }, { status: 500 });
    }
}