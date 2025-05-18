"use client";
import React, { useState } from 'react';
import Step1 from './Sale';
import Step2 from './Sale2';
import Step3 from './Performance';

function MultistepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data,user_LineID  }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (data) => {
    const finalData = { ...formData, ...data };
    setFormData(finalData);
    console.log("📦 ส่งข้อมูลทั้งหมด:", finalData);
    alert("✅ ส่งแบบสำรวจเรียบร้อย");
    // ส่งไป API หรือฐานข้อมูลที่นี่
  };

  return (
    <>
      {currentStep === 1 && (
        <Step1
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <Step2
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      {currentStep === 3 && (
        <Step3
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}  // ✅ เปลี่ยนจาก onNext เป็น onSubmit
          onPrev={handlePrev}
          user_LineID={user_LineID}
        />
      )}
    </>
  );
}

export default MultistepForm;
