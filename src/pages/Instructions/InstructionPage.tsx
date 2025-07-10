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

        {/* Part 3: Software Configuration */}
        <Card title="Part 3: Initial Software Configuration" size="small">
          <Paragraph>Now, let's link the two applications together.</Paragraph>
          <Alert
            message="Important: Complete these steps in order."
            description="Make sure dslrBooth is configured before you open ChronoSnap for the first time."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Timeline>
            <Timeline.Item>
              <Text strong>Open dslrBooth.</Text>
              <Paragraph>
                Launch the dslrBooth application. If it asks to detect a camera,
                make sure your camera is on and connected.
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item>
              <Text strong>Configure dslrBooth Settings.</Text>
              <Paragraph>
                Go to <Text code>Settings &gt; General</Text> and ensure your
                camera is visible and selected. Adjust basic quality and session
                settings as needed.
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item>
              <Text strong>Open ChronoSnap.</Text>
              <Paragraph>
                Now, launch the ChronoSnap application. It should automatically
                detect that dslrBooth is running.
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item color="green">
              <Text strong>Link ChronoSnap to dslrBooth.</Text>
              <Paragraph>
                In ChronoSnap, navigate to{" "}
                <Text code>Settings &gt; Booth Setup</Text>. You should see a
                status indicator showing{" "}
                <Text strong color="green">
                  "Connected to dslrBooth"
                </Text>
                . If not, use the "Find dslrBooth" button to manually link them.
              </Paragraph>
            </Timeline.Item>
          </Timeline>
        </Card>
        <Paragraph strong>
          Once your setup is complete and the software is connected, proceed to
          the "App Tutorial" to learn how to run your first event.
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
