// api/get/sale_Report_Report
import { connectMongoDB  } from '../../../../../lib/mongodb';
import sale_Report from '../../../../../models/sale_Report';
import { NextResponse } from "next/server";

// export async function GET(){
//     try {
//         await connectMongoDB ();
//         const reportData = await sale_Report.find({}); // เปลี่ยนชื่อ local variable
//         console.log("Fetched sale_Report:", reportData);
//         return NextResponse.json(reportData);
//     } catch (error) {
//         console.error("Error fetching sale_Report:", error);
//         return NextResponse.json({ message: "Error fetching sale_Report", error }, { status: 500 });
//     }
// }

export async function GET(req) {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const skip = (page - 1) * perPage;

    // Filter
    const query = {};

    // Search (ชื่อร้าน, จังหวัด, ผู้ลง ฯลฯ)
    const search = searchParams.get("search") || "";
    if (search) {
        query.$or = [
            { store_Name: { $regex: search, $options: "i" } },
            { store_Province: { $regex: search, $options: "i" } },
            // เพิ่ม field อื่นๆ ที่ต้องการค้นหา
        ];
    }

    // Filter ตัวอย่าง (ตาม code คุณ)
    if (searchParams.getAll("store_Channel").length)
        query.store_Channel = { $in: searchParams.getAll("store_Channel") };
    if (searchParams.getAll("store_Account").length)
        query.store_Account = { $in: searchParams.getAll("store_Account") };
    if (searchParams.getAll("store_Area2").length)
        query.store_Area2 = { $in: searchParams.getAll("store_Area2") };
    if (searchParams.getAll("report_cheerType").length)
        query.report_cheerType = { $in: searchParams.getAll("report_cheerType") };

    // Date range
    if (searchParams.get("dateFrom") || searchParams.get("dateTo")) {
        query.report_SubmitAt = {};
        if (searchParams.get("dateFrom"))
            query.report_SubmitAt.$gte = new Date(searchParams.get("dateFrom"));
        if (searchParams.get("dateTo"))
            query.report_SubmitAt.$lte = new Date(searchParams.get("dateTo"));
    }

    // Get total before pagination
    const total = await sale_Report.countDocuments(query);

    // Paginate data
    const rows = await sale_Report.find(query)
        .sort({ report_SubmitAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean();

    return NextResponse.json({ rows, total });
}