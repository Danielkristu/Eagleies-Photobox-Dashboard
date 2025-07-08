import React, { useState } from 'react';
import {
  DownloadOutlined,
  CodeOutlined,
  SettingOutlined,
  ReadOutlined,
  SmileOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Steps, Card, Button, Typography, Space, Divider, Collapse } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Component to render a code block
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre style={{
    background: '#f5f5f5',
    border: '1px solid rgb(255, 255, 255)',
    color: 'rgb(114, 0, 0)',
    padding: '16px',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  }}>
    <Text code copyable>{children}</Text>
  </pre>
);

// Content for each step
const stepsContent = [
  {
    title: 'Download',
    icon: <DownloadOutlined />,
    content: (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3} style={{ marginBottom: '-5px' }}>First, Let's Download Your Tools</Title>
      <Divider style={{ marginBottom: '-65px', marginTop: '-10px' }} />
        
        <Paragraph style={{ marginBottom: '-5px' }}>
          Welcome! To get your photobooth running, you'll need two key pieces of software. 
          Download both installers now, and we'll walk you through installing and connecting them in the next steps.
        </Paragraph>
        <Title level={4} style={{ marginTop: '10px', marginBottom: '-5px' }}>1. ChronoSnap App</Title>
        <Paragraph>
          This is the main application for managing your photo booth events.
        </Paragraph>
        <Button type="default" icon={<DownloadOutlined />} size="large" href="https://github.com/Danielkristu/Eagleies-Photobox-App/releases/download/v1.0.6/Photobox_1.0.6.rar">
          ChronoSnap App
        </Button>
        <Title level={4} style={{ marginTop: '20px', marginBottom: '-5px' }}>2. dslrBooth App</Title>
        <Paragraph>
          This software is required to control the camera and manage the photo session.
        </Paragraph>
        <Button type="default" icon={<DownloadOutlined />} size="large" href="https://eagleies.com/dslrBooth%20Professional%207.48.0324.1.rar">
          dslrBooth App
        </Button>
      </Space>
    ),
  },
  {
  title: 'Installation',
  icon: <CodeOutlined />,
  content: (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={3} style={{ marginBottom: '-5px' }}>Step 2: Install the Applications</Title>
      <Divider style={{ marginBottom: '-65px', marginTop: '-10px' }} />
      <Paragraph>
        Great job on downloading the files! Now, let's get them installed on your computer. You'll need to do this for both <Text strong>ChronoSnap</Text> and <Text strong>dslrBooth</Text>.
      </Paragraph>

      <div>
        <Title level={4}>1. Find and Extract the Downloaded Files</Title>
        <Paragraph>
          Go to your computer's
          <Text strong> Downloads </Text> folder to find the files you just downloaded (e.g., <Text code>ChronoSnap.zip</Text>). If the file is a ZIP folder, <Text strong>right-click</Text> on it and select <Text strong>"Extract All..."</Text> or <Text strong>"Unzip"</Text>. This will create a new folder with the installer inside.
        </Paragraph>
      </div>

      <div>
        <Title level={4}>2. Run the Installer</Title>
        <Paragraph>
          Open the new folder and find the application installer (look for an icon named <Text code>Photobox_1.x.x.exe</Text>, <Text code>setup.exe</Text>, or similar) and <Text strong>double-click</Text> it to begin. Follow the on-screen instructions in the installation wizard to complete the setup.
        </Paragraph>
      </div>

      <div>
        <Title level={4}>3. Repeat for the Second App</Title>
        <Paragraph>
          Don't forget! Once you finish installing the first application, please repeat the exact same steps to install the second one. Both must be installed to continue.
        </Paragraph>
      </div>
      <Divider style={{ marginBottom: '-65px', marginTop: '-10px' }} />
      <div>
        <Title level={4} style={{ marginTop: '10px' }}>dslrBooth App Installation</Title>
        <div>
          <Paragraph>
            1. After extracting the files, open the folder and locate the installer for dslrBooth (look for an icon named <Text code>dslrBooth.exe</Text> or similar).
          </Paragraph>
          <Paragraph>
            2. Run the installer by double-clicking the <Text code>dslrBooth.exe</Text> file and follow the on-screen instructions.
          </Paragraph>
          <Paragraph>
            3. Don't open the app yet, after installation.
          </Paragraph>
          <Paragraph>
            4. Once the app is installed, locate the <Text code>dslrBooth Resource</Text> folders. Don't open the app yet, after installation.
          </Paragraph>
          <Paragraph>
            5. Copy the contents of the <Text code>dslrBooth Resource</Text> folder to this path: <Text code>C:\Program Files\dslrBooth</Text> and replace it.
          </Paragraph>
        </div>
      </div>
      <Divider style={{ marginBottom: '-65px', marginTop: '-5px' }} />

       <Title level={5}>
        Once both apps are installed, click on the "Configuration" step above to continue.
      </Title>
    </Space>
  ),
},
  {
    title: 'Configuration',
    icon: <SettingOutlined />,
    content: (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3}>Configure Settings</Title>
        <Paragraph>
          The application requires some environment variables to be set up. Create a new file named <Text code>.env.local</Text> in the root of your project by copying the example file.
        </Paragraph>
        <CodeBlock>cp .env.example .env.local</CodeBlock>
        <Paragraph>
          Now, open the <Text code>.env.local</Text> file and update the variables with your specific configuration, such as API endpoints or authentication keys.
        </Paragraph>
        <Card size="small">
          <Text strong>Example .env.local</Text>
          <CodeBlock>
            {`REACT_APP_API_URL=https://api.your-service.com\nREACT_APP_AUTH_PROVIDER_KEY=your-secret-key`}
          </CodeBlock>
        </Card>
      </Space>
    ),
  },
  {
    title: 'App Tutorial',
    icon: <ReadOutlined />,
    content: (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3}>Application Flow Tutorial</Title>
        <Paragraph>
          Welcome to the dashboard! Here’s a quick tour of the main features to get you started.
        </Paragraph>
        <Collapse accordion>
          <Panel header="1. Navigating the Dashboard" key="1">
            <Paragraph>
              The main navigation menu is on the left side. You can use it to switch between different sections like 'Analytics', 'User Management', and 'Settings'. The main content for each section will be displayed in this central area.
            </Paragraph>
          </Panel>
          <Panel header="2. Creating a New Record" key="2">
            <Paragraph>
              In most data tables (e.g., 'Products' or 'Customers'), you will find an "Add New" button. Clicking this will open a form where you can enter the required information and save it.
            </Paragraph>
          </Panel>
          <Panel header="3. Editing and Deleting Data" key="3">
            <Paragraph>
              Each row in a data table has 'Edit' and 'Delete' actions. Use these to update existing records or remove them. You will be asked for confirmation before any deletion.
            </Paragraph>
          </Panel>
        </Collapse>
      </Space>
    ),
  },
  {
    title: 'Done',
    icon: <SmileOutlined />,
    content: (
       <div style={{ textAlign: 'center' }}>
        <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '20px' }} />
        <Title level={3}>You're All Set!</Title>
        <Paragraph>
          You have successfully completed the setup process. You can now run the application and start building your amazing dashboard.
        </Paragraph>
         <CodeBlock>npm start</CodeBlock>
      </div>
    )
  }
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
