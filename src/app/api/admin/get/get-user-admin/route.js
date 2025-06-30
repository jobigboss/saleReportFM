// api/admin/get/get-user-admin
import { connectMongoDB  } from '../../../../../../lib/mongodb';
import UserAdmin from '../../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectMongoDB ();
        const userAdminData = await UserAdmin.find({}); // เปลี่ยนชื่อ local variable
        console.log("Fetched UserAdmin:", userAdminData);
        return NextResponse.json(userAdminData);
    } catch (error) {
        console.error("Error fetching UserAdmin:", error);
        return NextResponse.json({ message: "Error fetching UserAdmin", error }, { status: 500 });
    }
}