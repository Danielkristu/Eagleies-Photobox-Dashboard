import React, { useState } from 'react';
import {
  DownloadOutlined,
  CodeOutlined,
  SettingOutlined,
  ReadOutlined,
  SmileOutlined,
  CheckCircleOutlined,
  CameraOutlined,
  LaptopOutlined,
  BulbOutlined,
  BlockOutlined,
} from "@ant-design/icons";
import {
  Steps,
  Card,
  Button,
  Typography,
  Space,
  Divider,
  Collapse,
  List,
  Timeline,
  Avatar,
  Alert,
  Image,
} from "antd";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Component to render a code block
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre
    style={{
      background: "#f5f5f5",
      border: "1px solid rgb(255, 255, 255)",
      color: "rgb(114, 0, 0)",
      padding: "16px",
      borderRadius: "8px",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
    }}
  >
    <Text code copyable>
      {children}
    </Text>
  </pre>
);

// Content for each step
const stepsContent = [
  {
    title: "Download",
    icon: <DownloadOutlined />,
    content: (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Title level={3} style={{ marginBottom: "-5px" }}>
          First, Let's Download Your Tools
        </Title>
        <Divider style={{ marginBottom: "-65px", marginTop: "-5px" }} />

        <Paragraph style={{ marginBottom: "-5px" }}>
          Welcome! To get your photobooth running, you'll need two key pieces of
          software. Download both installers now, and we'll walk you through
          installing and connecting them in the next steps.
        </Paragraph>
        <Title level={4} style={{ marginTop: "10px", marginBottom: "-5px" }}>
          1. ChronoSnap App
        </Title>
        <Paragraph>
          This is the main application for managing your photo booth events.
        </Paragraph>
        <Button
          type="default"
          icon={<DownloadOutlined />}
          size="large"
          href="https://github.com/Danielkristu/Eagleies-Photobox-App/releases/download/v1.0.6/Photobox_1.0.6.rar"
        >
          ChronoSnap App
        </Button>
        <Title level={4} style={{ marginTop: "20px", marginBottom: "-5px" }}>
          2. dslrBooth App
        </Title>
        <Paragraph>
          This software is required to control the camera and manage the photo
          session.
        </Paragraph>
        <Button
          type="default"
          icon={<DownloadOutlined />}
          size="large"
          href="https://eagleies.com/dslrBooth%20Professional%207.48.0324.1.rar"
        >
          dslrBooth App
        </Button>
      </Space>
    ),
  },
  {
    title: "Installation",
    icon: <CodeOutlined />,
    content: (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ marginBottom: "-5px" }}>
          Step 2: Install the Applications
        </Title>
        <Divider style={{ marginBottom: "-65px", marginTop: "-10px" }} />
        <Paragraph>
          Great job on downloading the files! Now, let's get them installed on
          your computer. You'll need to do this for both{" "}
          <Text strong>ChronoSnap</Text> and <Text strong>dslrBooth</Text>.
        </Paragraph>

        <div>
          <Title level={4}>1. Find and Extract the Downloaded Files</Title>
          <Paragraph>
            Go to your computer's
            <Text strong> Downloads </Text> folder to find the files you just
            downloaded (e.g., <Text code>ChronoSnap.zip</Text>). If the file is
            a ZIP folder, <Text strong>right-click</Text> on it and select{" "}
            <Text strong>"Extract All..."</Text> or <Text strong>"Unzip"</Text>.
            This will create a new folder with the installer inside.
          </Paragraph>
        </div>

        <div>
          <Title level={4}>2. Run the Installer</Title>
          <Paragraph>
            Open the new folder and find the application installer (look for an
            icon named <Text code>Photobox_1.x.x.exe</Text>,{" "}
            <Text code>setup.exe</Text>, or similar) and{" "}
            <Text strong>double-click</Text> it to begin. Follow the on-screen
            instructions in the installation wizard to complete the setup.
          </Paragraph>
        </div>

        <div>
          <Title level={4}>3. Repeat for the Second App</Title>
          <Paragraph>
            Don't forget! Once you finish installing the first application,
            please repeat the exact same steps to install the second one. Both
            must be installed to continue.
          </Paragraph>
        </div>
        <Divider style={{ marginBottom: "-65px", marginTop: "-10px" }} />
        <div>
          <Title level={4} style={{ marginBottom: "15px" }}>
            In-App Installation Instructions (Important)
          </Title>
          <Collapse accordion>
            <Panel header="dslrBooth App Installation" key="1">
              <div>
                <Paragraph>
                  1. After extracting the files, open the folder and locate the
                  installer for dslrBooth (look for an icon named{" "}
                  <Text code>dslrBooth.exe</Text> or similar).
                </Paragraph>
                <Paragraph>
                  2. Run the installer by double-clicking the{" "}
                  <Text code>dslrBooth.exe</Text> file and follow the on-screen
                  instructions.
                </Paragraph>
                <Paragraph>
                  3. Don't open the app yet, after installation.
                </Paragraph>
                <Paragraph>
                  4. Once the app is installed, locate the{" "}
                  <Text code>dslrBooth Resource</Text> folders. Don't open the
                  app yet, after installation.
                </Paragraph>
                <Paragraph>
                  5. Copy the contents of the{" "}
                  <Text code>dslrBooth Resource</Text> folder to this path:{" "}
                  <Text code>C:\Program Files\dslrBooth</Text> and replace it.
                </Paragraph>
              </div>
            </Panel>
            <Panel header="ChronoSnap App Installation" key="2">
              <div>
                <Paragraph>
                  1. After extracting the files, open the folder and locate the
                  installer for ChronoSnap (look for an icon named{" "}
                  <Text code>ChronoSnap.exe</Text> or similar).
                </Paragraph>
                <Paragraph>
                  2. Run the installer by double-clicking the{" "}
                  <Text code>ChronoSnap.exe</Text> file and follow the on-screen
                  instructions.
                </Paragraph>
                <Paragraph>
                  3. You can pin it to taskbar for easy access later.
                </Paragraph>
              </div>
            </Panel>
          </Collapse>
        </div>
        <Divider style={{ marginBottom: "-65px", marginTop: "-5px" }} />

        <Title level={5}>
          Once both apps are installed, click on the "Configuration" step above
          to continue.
        </Title>
      </Space>
    ),
  },
  {
    title: "Configuration",
    icon: <SettingOutlined />,
    content: (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3}>Step 3: Booth Setup & Configuration</Title>
        <Paragraph>
          This is the most important step. We'll walk you through setting up
          your physical photo booth and connecting the software. Please follow
          each part carefully.
        </Paragraph>

        {/* Part 1: Equipment Checklist */}
        <Card title="Part 1: Gather Your Equipment" size="small">
          <Paragraph>
            Before you begin, make sure you have all the necessary hardware:
          </Paragraph>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: "DSLR Camera",
                description: "A compatible Canon, Nikon, or Sony camera.",
                icon: <CameraOutlined />,
              },
              {
                title: "Laptop or PC",
                description: "To run ChronoSnap and dslrBooth.",
                icon: <LaptopOutlined />,
              },
              {
                title: "Tripod",
                description: "To keep your camera stable.",
                icon: (
                  <i className="anticon">
                    <svg
                      viewBox="0 0 1024 1024"
                      fill="currentColor"
                      height="1em"
                      width="1em"
                    >
                      <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H407c-8.5 0-16.7 3.4-22.6 9.4L169.4 288.6c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L384 164.7V856c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V164.7l169.4 169.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z" />
                    </svg>
                  </i>
                ),
              },
              {
                title: "Lighting",
                description: "A ring light or softbox for great photos.",
                icon: <BulbOutlined />,
              },
              {
                title: "Backdrop",
                description: "A physical background for your booth.",
                icon: <BlockOutlined />,
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={item.icon} />}
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Part 2: Physical Setup */}
        <Card title="Part 2: Physical Booth Setup" size="small">
          <Timeline>
            <Timeline.Item>Mount your DSLR camera on the tripod.</Timeline.Item>
            <Timeline.Item>
              Position your lighting source in front of where people will stand.
            </Timeline.Item>
            <Timeline.Item>
              Set up your backdrop behind the photo area.
            </Timeline.Item>
            <Timeline.Item color="green">
              <Text strong>
                Connect your camera to the laptop using its USB cable. This is a
                critical step!
              </Text>
            </Timeline.Item>
          </Timeline>
        </Card>

        {/* Part 3: Software Configuration - REVISED */}
        <Card title="Part 3: Linking ChronoSnap and dslrBooth" size="small">
          <Alert
            message="Follow these steps exactly."
            description="This process ensures that when a photo is taken in dslrBooth, the information is correctly sent back to your ChronoSnap dashboard."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Timeline>
            <Timeline.Item>
              <Text strong>
                1. Set Your Xendit API Key (Required for Payments)
              </Text>
              <Paragraph>
                In your ChronoSnap dashboard, click on your profile icon in the
                top right, then go to <Text code>Account Settings</Text>. Scroll
                down to the "Xendit API Key Settings" section. Enter the API key
                from your Xendit dashboard and click{" "}
                <Text strong>"Save Settings"</Text>.
              </Paragraph>
              <Image
                src="https://eagleies.com/img/XenditAPI%20docs.png"
                alt="Xendit API Key Settings"
                style={{
                  width: "80%",
                  maxWidth: "600px",
                  marginBottom: "16px",
                }}
              />
            </Timeline.Item>

            <Timeline.Item>
              <Text strong>2. Add a New Booth in ChronoSnap</Text>
              <Paragraph>
                In your ChronoSnap dashboard, go to the "Your Booths" section
                and click the <Text code>+ Add Booth</Text> button. This will
                take you to the "Booth Settings" page for your new booth.
              </Paragraph>
            </Timeline.Item>

            <Timeline.Item>
              <Text strong>3. Get API Details from dslrBooth</Text>
              <Paragraph>
                Open the dslrBooth application. Navigate to{" "}
                <Text code>Settings &gt; General &gt; API</Text>. Keep this
                window open. You will need to copy two items from here.{" "}
                <Text code>Example URL</Text> and <Text code>Password</Text>.
                These will be used to connect ChronoSnap to dslrBooth.
              </Paragraph>
              <Image
                src="https://eagleies.com/img/dslrBooth%20API%20docs.png"
                alt="Add Booth"
                style={{
                  width: "80%",
                  maxWidth: "600px",
                  marginBottom: "16px",
                }}
              />
            </Timeline.Item>

            <Timeline.Item>
              <Text strong>4. Fill in Booth Settings in ChronoSnap</Text>
              <Paragraph>
                Now, switch back to the ChronoSnap "Booth Settings" page and
                fill in the following fields:
                <ul>
                  <li>
                    <Text strong>Booth Name:</Text> Give your booth a unique
                    name (e.g., "Wedding Party").
                  </li>
                  <li>
                    <Text strong>DSLRBooth API Key:</Text> Copy the{" "}
                    <Text code>Example URL</Text> from dslrBooth's API settings
                    and paste it here.
                  </li>
                  <li>
                    <Text strong>DSLRBooth Password:</Text> Copy the{" "}
                    <Text code>Password</Text> from dslrBooth's API settings and
                    paste it here.
                  </li>
                </ul>
                <Image
                  src="https://eagleies.com/img/BoothSettings%20docs.png"
                  alt="Add Booth"
                  style={{
                    width: "80%",
                    maxWidth: "600px",
                    marginBottom: "16px",
                  }}
                />
              </Paragraph>
            </Timeline.Item>

            <Timeline.Item>
              <Text strong>5. Set Payment Webhooks in Xendit</Text>
              <Paragraph>
                In ChronoSnap's "Booth Settings" page, scroll to the
                "Installation" section and copy the{" "}
                <Text code>Callback URL</Text>. Now, go to your Xendit
                Dashboard. Navigate to{" "}
                <Text code>Settings &gt; Developers &gt; Webhooks</Text>. Paste
                the copied URL into the fields for{" "}
                <Text strong>"QR code terbayarkan & di-refund"</Text> and{" "}
                <Text strong>"Payment Session Completed"</Text>. Click save.
              </Paragraph>
              <Alert
                type="info"
                showIcon
                message="Note on Testing Webhooks"
                description="If you click the 'Test' button in Xendit and it returns an error, please ignore it. The test payload from Xendit does not contain the necessary data our system needs to validate it, but it will work correctly with live payments."
                style={{ marginTop: "10px" }}
              />
              <Image
                src="https://eagleies.com/img/XenditWebhooksDash%20docs.png"
                alt="Add Booth"
                style={{
                  width: "80%",
                  maxWidth: "600px",
                  marginBottom: "16px",
                  marginTop: "16px",
                }}
              />
            </Timeline.Item>

            <Timeline.Item>
              <Text strong>6. Copy the Triggers URL from ChronoSnap</Text>
              <Paragraph>
                After saving, stay on the "Booth Settings" page. Scroll down to
                the "Installation" section and find the field labeled{" "}
                <Text code>Triggers URL</Text>. Click the "Copy" button next to
                it.
              </Paragraph>
              <Image
                src="https://eagleies.com/img/InstallationSetup%20docs.png"
                alt="Add Booth"
                style={{
                  width: "80%",
                  maxWidth: "600px",
                  marginBottom: "16px",
                }}
              />
            </Timeline.Item>

            <Timeline.Item>
              <Text strong>6. Set the Trigger in dslrBooth</Text>
              <Paragraph>
                Go back to dslrBooth. Go to{" "}
                <Text code>Settings &gt; Triggers</Text>. In the{" "}
                <Text code>URL</Text> field, paste the Triggers URL you just
                copied from ChronoSnap. This tells dslrBooth where to send data
                after an event.
              </Paragraph>
              <Image
                src="https://eagleies.com/img/TriggersURL%20docs.png"
                alt="Add Booth"
                style={{
                  width: "80%",
                  maxWidth: "600px",
                  marginBottom: "16px",
                }}
              />
            </Timeline.Item>

            <Timeline.Item color="green">
              <Text strong>7. Note Your Access Code</Text>
              <Paragraph>
                Finally, go back to the ChronoSnap "Booth Settings" page. The{" "}
                <Text code>Booth Code</Text> (e.g.,{" "}
                <Text strong>"AZYF-7324"</Text>) is the final piece. This is the
                unique code you will enter into the photobooth app on your
                device to connect it to this specific booth's settings.
              </Paragraph>
            </Timeline.Item>
          </Timeline>
        </Card>

        <Paragraph strong>
          Your configuration is complete! Proceed to the "App Tutorial" to learn
          how to manage your first event.
        </Paragraph>
      </Space>
    ),
  },
  {
    title: "App Tutorial",
    icon: <ReadOutlined />,
    content: (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Title level={3}>Application Flow Tutorial</Title>
        <Paragraph>
          Welcome to the dashboard! Here’s a quick tour of the main features to
          get you started.
        </Paragraph>
        <Collapse accordion>
          <Panel header="1. Navigating the Dashboard" key="1">
            <Paragraph>
              The main navigation menu is on the left side. You can use it to
              switch between different sections like 'Analytics', 'User
              Management', and 'Settings'. The main content for each section
              will be displayed in this central area.
            </Paragraph>
          </Panel>
          <Panel header="2. Creating a New Record" key="2">
            <Paragraph>
              In most data tables (e.g., 'Products' or 'Customers'), you will
              find an "Add New" button. Clicking this will open a form where you
              can enter the required information and save it.
            </Paragraph>
          </Panel>
          <Panel header="3. Editing and Deleting Data" key="3">
            <Paragraph>
              Each row in a data table has 'Edit' and 'Delete' actions. Use
              these to update existing records or remove them. You will be asked
              for confirmation before any deletion.
            </Paragraph>
          </Panel>
        </Collapse>
      </Space>
    ),
  },
  {
    title: "Done",
    icon: <SmileOutlined />,
    content: (
      <div style={{ textAlign: "center" }}>
        <CheckCircleOutlined
          style={{ fontSize: "48px", color: "#52c41a", marginBottom: "20px" }}
        />
        <Title level={3}>You're All Set!</Title>
        <Paragraph>
          You have successfully completed the setup process. You can now run the
          application and start building your amazing dashboard.
        </Paragraph>
        <CodeBlock>npm start</CodeBlock>
      </div>
    ),
  },
];


const InstructionPage = () => {
  const [current, setCurrent] = useState(0);

  const onChange = (value: number) => {
    setCurrent(value);
  };

  return (
    <Card style={{ margin: '24px' }} bordered>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Getting Started Guide</Title>
      <Steps
        current={current}
        onChange={onChange}
        items={stepsContent.map(item => ({ key: item.title, title: item.title, icon: item.icon }))}
        style={{ marginBottom: '40px' }}
      />
      
      <Divider />

      <div style={{ padding: '40px 24px', minHeight: 320 }}>
        {stepsContent[current].content}
      </div>
    </Card>
  );
};

export default InstructionPage;
