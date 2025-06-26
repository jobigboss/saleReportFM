// api/get/sale_Report_Performance
import { connectMongoDB  } from '../../../../../lib/mongodb';
import sale_Report from '../../../../../models/sale_Report';
import { NextResponse } from "next/server";


export async function GET(req) {
    try {
        await connectMongoDB();

        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        const query = {};

        if (start && end) {
            query.report_SubmitAt = {
                $gte: new Date(start),
                $lte: new Date(end + 'T23:59:59.999Z'),
            };
        }

        const reportData = await sale_Report.find(query);
        console.log("📊 Filtered sale_Report:", query, reportData.length);

        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Error fetching sale_Report:", error);
        return NextResponse.json({ message: "Error fetching sale_Report", error }, { status: 500 });
    }
}
