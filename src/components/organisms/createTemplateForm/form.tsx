import React, { FC, useState } from "react";
import { useRouter } from "next/router";
import { message, Steps, Row, Col, Form } from "antd";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebaseConfig";
import Inputs from "@/components/atoms/inputs/inputs";
import Buttons from "@/components/atoms/buttons/button";
import SelectGroup from "@/components/molecules/selectGroup/selectGroup";
import InputGroup from "@/components/molecules/inputGroup/inputGroup";
import styles from "./index.module.scss";
import { Labels } from "@/components/atoms/labels/label";
import * as yup from "yup";

const { Step } = Steps;

const CreateTemplateForm: FC = () => {
  const [templateName, setTemplateName] = useState("");
  const [step, setStep] = useState("");
  const [stepNames, setStepNames] = useState<{ id: string; name: string }[]>(
    []
  );
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const router = useRouter();
  const auth = getAuth();

  const schema = yup.object().shape({
    templateName: yup.string().required("Template Name is required"),
    steps: yup.string().required("Number of Steps is required"),
    stepNames: yup.array().of(
      yup.object().shape({
        name: yup.string().required("Step Name is required"),
      })
    ),
  });

  const handleCreateTemplate = async () => {
    try {
      await schema.validate({ templateName, steps: step, stepNames });
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is signed in.");
        return;
      }

      await addDoc(collection(db, "templates"), {
        name: templateName,
        step: parseInt(step, 10),
        step_names: stepNames,
        user_id: user.uid,
      });

      message.success("Template and steps created successfully");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        message.error(error.message);
      } else {
        console.error("Error creating template and steps:", error);
        message.error("Error creating template and steps");
      }
    }
  };

  const handleStepNameChange = (index: number, value: string) => {
    const newStepNames = [...stepNames];
    newStepNames[index].name = value;
    setStepNames(newStepNames);
  };

  const handleStepChange = (value: string) => {
    setStep(value);
    const stepCount = parseInt(value, 10) || 0;
    const newStepNames = [];
    for (let i = 0; i < stepCount; i++) {
      newStepNames.push({ id: uuidv4(), name: "" });
    }
    setStepNames(newStepNames);
  };

  const next = () => {
    form
      .validateFields()
      .then(() => {
        setCurrent(current + 1);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: "Template Name",
      content: (
        <Form.Item
          name="templateName"
          rules={[{ required: true, message: "Template Name is required" }]}
        >
          <InputGroup
            label="Template Name"
            name="templateName"
            onChange={(e) => setTemplateName(e.target.value)}
            value={templateName}
            type="text"
          />
        </Form.Item>
      ),
    },
    {
      title: "Number of Steps",
      content: (
        <Form.Item
          name="steps"
          rules={[{ required: true, message: "Number of Steps is required" }]}
        >
          <SelectGroup
            label="Number of Steps"
            name="steps"
            onChange={handleStepChange}
            value={step}
            options={[1, 2, 3, 4, 5].map((num) => ({
              value: num.toString(),
              label: num.toString(),
            }))}
            placeholder="Select number of steps"
          />
        </Form.Item>
      ),
    },
    {
      title: "Step Names",
      content: (
        <>
          {stepNames.map((step, index) => (
            <Form.Item
              key={index}
              name={`stepName${index}`}
              rules={[{ required: true, message: "Step Name is required" }]}
            >
              <div>
                <Labels
                  htmlFor={`stepName${index}`}
                  text={`Step ${index + 1}:`}
                />
                <Inputs
                  key={index}
                  name={`stepName${index}`}
                  onChange={(e) => handleStepNameChange(index, e.target.value)}
                  value={step.name}
                  type="text"
                />
              </div>
            </Form.Item>
          ))}
        </>
      ),
    },
  ];

  return (
    <div className={styles.content}>
      <h2>Create a New Template</h2>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <Form form={form} layout="vertical">
        <div className={styles.stepContent}>{steps[current].content}</div>
      </Form>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        {current > 0 && (
          <Buttons text="Previous" onClick={prev} htmlType="button" />
        )}
        {current < steps.length - 1 && (
          <Buttons text="Next" onClick={next} htmlType="button" />
        )}
        {current === steps.length - 1 && (
          <Buttons
            text="Save"
            onClick={handleCreateTemplate}
            htmlType="button"
          />
        )}
      </div>
    </div>
  );
};

export default CreateTemplateForm;
