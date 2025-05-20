// /app/api/send-line/route.js (Next.js App Router)
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId, summary } = await req.json();
  const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  const flexMessage = {
    type: "flex",
    altText: "📋 รายงานกิจกรรมโปรโมชั่น",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📋 รายงานกิจกรรม",
            weight: "bold",
            size: "lg",
            color: "#C97440",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: summary.map((section) => ({
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            {
              type: "text",
              text: section.title,
              weight: "bold",
              size: "md",
              color: "#444444",
            },
            {
              type: "text",
              text: section.content || "-",
              wrap: true,
              color: "#555555",
              size: "sm",
            },
          ],
        })),
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ส่งจากระบบสำรวจภาคสนาม",
            size: "xs",
            align: "center",
            color: "#aaaaaa",
          },
        ],
      },
    },
  };

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelToken}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [flexMessage],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ success: false, error: err }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
