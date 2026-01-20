import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { jsPDF } from "npm:jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HealthRecord {
  id: string;
  patient_name: string;
  age: number;
  gender: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  medical_history?: string;
  current_medications?: string;
  symptoms?: string;
  diagnosis?: string;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recordId } = await req.json();

    if (!recordId) {
      return new Response(
        JSON.stringify({ error: "Record ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: record, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("id", recordId)
      .maybeSingle();

    if (error || !record) {
      return new Response(
        JSON.stringify({ error: "Health record not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    pdf.setFontSize(24);
    pdf.setTextColor(41, 98, 255);
    pdf.text("HEALTH REPORT", pageWidth / 2, yPos, { align: "center" });

    yPos += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 15;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, yPos, pageWidth - 15, yPos);

    yPos += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("PATIENT INFORMATION", 15, yPos);

    yPos += 8;
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);

    pdf.text(`Name: ${record.patient_name}`, 15, yPos);
    yPos += 7;
    pdf.text(`Age: ${record.age} years`, 15, yPos);
    yPos += 7;
    pdf.text(`Gender: ${record.gender.charAt(0).toUpperCase() + record.gender.slice(1)}`, 15, yPos);
    yPos += 7;
    pdf.text(`Record ID: ${record.id}`, 15, yPos);

    yPos += 12;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, yPos, pageWidth - 15, yPos);

    yPos += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("VITAL SIGNS", 15, yPos);

    yPos += 8;
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);

    if (record.blood_pressure_systolic && record.blood_pressure_diastolic) {
      pdf.text(
        `Blood Pressure: ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic} mmHg`,
        15,
        yPos
      );
      yPos += 7;
    }

    if (record.heart_rate) {
      pdf.text(`Heart Rate: ${record.heart_rate} BPM`, 15, yPos);
      yPos += 7;
    }

    if (record.temperature) {
      pdf.text(`Temperature: ${record.temperature}°F`, 15, yPos);
      yPos += 7;
    }

    if (record.weight) {
      pdf.text(`Weight: ${record.weight} lbs`, 15, yPos);
      yPos += 7;
    }

    if (record.height) {
      const feet = Math.floor(record.height / 12);
      const inches = record.height % 12;
      pdf.text(`Height: ${feet}'${inches}" (${record.height} inches)`, 15, yPos);
      yPos += 7;
    }

    if (record.weight && record.height) {
      const heightInMeters = (record.height * 2.54) / 100;
      const weightInKg = record.weight * 0.453592;
      const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      pdf.text(`BMI: ${bmi}`, 15, yPos);
      yPos += 7;
    }

    yPos += 5;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, yPos, pageWidth - 15, yPos);

    yPos += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("MEDICAL DETAILS", 15, yPos);

    yPos += 8;
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);

    if (record.medical_history) {
      pdf.setFont(undefined, "bold");
      pdf.text("Medical History:", 15, yPos);
      yPos += 6;
      pdf.setFont(undefined, "normal");
      const historyLines = pdf.splitTextToSize(
        record.medical_history,
        pageWidth - 30
      );
      pdf.text(historyLines, 15, yPos);
      yPos += historyLines.length * 5 + 5;
    }

    if (record.current_medications) {
      pdf.setFont(undefined, "bold");
      pdf.text("Current Medications:", 15, yPos);
      yPos += 6;
      pdf.setFont(undefined, "normal");
      const medLines = pdf.splitTextToSize(
        record.current_medications,
        pageWidth - 30
      );
      pdf.text(medLines, 15, yPos);
      yPos += medLines.length * 5 + 5;
    }

    if (record.symptoms) {
      pdf.setFont(undefined, "bold");
      pdf.text("Current Symptoms:", 15, yPos);
      yPos += 6;
      pdf.setFont(undefined, "normal");
      const symptomLines = pdf.splitTextToSize(record.symptoms, pageWidth - 30);
      pdf.text(symptomLines, 15, yPos);
      yPos += symptomLines.length * 5 + 5;
    }

    if (record.diagnosis) {
      pdf.setFont(undefined, "bold");
      pdf.text("Diagnosis / Notes:", 15, yPos);
      yPos += 6;
      pdf.setFont(undefined, "normal");
      const diagnosisLines = pdf.splitTextToSize(
        record.diagnosis,
        pageWidth - 30
      );
      pdf.text(diagnosisLines, 15, yPos);
      yPos += diagnosisLines.length * 5 + 5;
    }

    yPos += 10;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "This report is generated for informational purposes only.",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 4;
    pdf.text(
      "Please consult with a healthcare professional for medical advice.",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    const pdfBuffer = pdf.output("arraybuffer");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="health-report-${recordId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
