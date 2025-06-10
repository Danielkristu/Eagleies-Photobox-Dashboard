/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"; // Changed updateDoc to setDoc
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { db, storage } from "../firebase";
import {
  Card,
  Button,
  Typography,
  notification,
  Spin,
  Upload,
  Avatar,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";

const { Title, Text: TypographyText } = Typography;

interface UserIdentity {
  id: string;
  email: string;
  name: string;
}

interface Background {
  url: string;
  is_active: boolean;
}

const BoothBackgroundsPage: React.FC = () => {
  const { boothId } = useParams<{ boothId: string }>();
  const navigate = useNavigate();
  const { data: userIdentity, isLoading: identityLoading } =
    useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [homeBgUrl, setHomeBgUrl] = useState<string | null>(null);
  const [startBgUrl, setStartBgUrl] = useState<string | null>(null);
  const [voucherBgUrl, setVoucherBgUrl] = useState<string | null>(null);
  const [succeedBgUrl, setSucceedBgUrl] = useState<string | null>(null);
  const [qrisBgUrl, setQrisBgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!identityLoading) {
      if (!userIdentity) {
        console.log("User not authenticated, redirecting to login...");
        navigate("/login");
        notification.warning({
          message: "Authentication Required",
          description: "Please log in to access this page.",
        });
      } else {
        const auth = getAuth();
        console.log("Authenticated User ID from useGetIdentity:", userId);
        console.log("Firebase Auth UID:", auth.currentUser?.uid);
        console.log("Booth ID:", boothId);
        if (auth.currentUser?.uid !== userId) {
          console.warn("Mismatch between useGetIdentity ID and Firebase UID");
        }
      }
    }
  }, [userIdentity, identityLoading, navigate]);

  const fetchBackgrounds = async () => {
    if (!userId || !boothId) return;
    setLoading(true);
    try {
      const backgroundsRef = (type: string) =>
        doc(db, "Clients", userId, "Booths", boothId, "backgrounds", type);
      const [homeSnap, startSnap, voucherSnap, succeedSnap, qrisSnap] =
        await Promise.all([
          getDoc(backgroundsRef("homeBg")),
          getDoc(backgroundsRef("startBg")),
          getDoc(backgroundsRef("voucherBg")),
          getDoc(backgroundsRef("succeedBg")),
          getDoc(backgroundsRef("qrisBg")),
        ]);

      setHomeBgUrl(homeSnap.exists() ? homeSnap.data()?.url || null : null);
      setStartBgUrl(startSnap.exists() ? startSnap.data()?.url || null : null);
      setVoucherBgUrl(
        voucherSnap.exists() ? voucherSnap.data()?.url || null : null
      );
      setSucceedBgUrl(
        succeedSnap.exists() ? succeedSnap.data()?.url || null : null
      );
      setQrisBgUrl(qrisSnap.exists() ? qrisSnap.data()?.url || null : null);
    } catch (error: any) {
      notification.error({
        message: "Error fetching backgrounds",
        description:
          error.message || "An error occurred while fetching backgrounds.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadHomeBg = async (file: File) => {
    if (!userId || !boothId) return false;
    const storageRef = ref(
      storage,
      `backgrounds/${userId}/${boothId}/homeBg/${file.name}`
    );
    try {
      setLoading(true);
      console.log("Attempting to upload to:", storageRef.fullPath);
      console.log("Current Firebase User:", getAuth().currentUser);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      const backgroundRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "backgrounds",
        "homeBg"
      );
      await setDoc(
        backgroundRef,
        { url: imageUrl, is_active: true },
        { merge: true }
      ); // Changed to setDoc
      setHomeBgUrl(imageUrl);
      notification.success({
        message: "Success",
        description: "Home background uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      notification.error({
        message: "Error uploading Home background",
        description: error.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleUploadStartBg = async (file: File) => {
    if (!userId || !boothId) return false;
    const storageRef = ref(
      storage,
      `backgrounds/${userId}/${boothId}/startBg/${file.name}`
    );
    try {
      setLoading(true);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      const backgroundRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "backgrounds",
        "startBg"
      );
      await setDoc(
        backgroundRef,
        { url: imageUrl, is_active: true },
        { merge: true }
      );
      setStartBgUrl(imageUrl);
      notification.success({
        message: "Success",
        description: "Start background uploaded successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error uploading Start background",
        description: error.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleUploadVoucherBg = async (file: File) => {
    if (!userId || !boothId) return false;
    const storageRef = ref(
      storage,
      `backgrounds/${userId}/${boothId}/voucherBg/${file.name}`
    );
    try {
      setLoading(true);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      const backgroundRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "backgrounds",
        "voucherBg"
      );
      await setDoc(
        backgroundRef,
        { url: imageUrl, is_active: true },
        { merge: true }
      );
      setVoucherBgUrl(imageUrl);
      notification.success({
        message: "Success",
        description: "Voucher background uploaded successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error uploading Voucher background",
        description: error.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleUploadSucceedBg = async (file: File) => {
    if (!userId || !boothId) return false;
    const storageRef = ref(
      storage,
      `backgrounds/${userId}/${boothId}/succeedBg/${file.name}`
    );
    try {
      setLoading(true);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      const backgroundRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "backgrounds",
        "succeedBg"
      );
      await setDoc(
        backgroundRef,
        { url: imageUrl, is_active: true },
        { merge: true }
      );
      setSucceedBgUrl(imageUrl);
      notification.success({
        message: "Success",
        description: "Succeed background uploaded successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error uploading Succeed background",
        description: error.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleUploadQrisBg = async (file: File) => {
    if (!userId || !boothId) return false;
    const storageRef = ref(
      storage,
      `backgrounds/${userId}/${boothId}/qrisBg/${file.name}`
    );
    try {
      setLoading(true);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      const backgroundRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "backgrounds",
        "qrisBg"
      );
      await setDoc(
        backgroundRef,
        { url: imageUrl, is_active: true },
        { merge: true }
      );
      setQrisBgUrl(imageUrl);
      notification.success({
        message: "Success",
        description: "QRIS background uploaded successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error uploading QRIS background",
        description: error.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
    return false;
  };

  useEffect(() => {
    if (userId && boothId) {
      fetchBackgrounds();

      const backgroundTypes = [
        "homeBg",
        "startBg",
        "voucherBg",
        "succeedBg",
        "qrisBg",
      ];
      const unsubscribes = backgroundTypes.map((type) =>
        onSnapshot(
          doc(db, "Clients", userId, "Booths", boothId, "backgrounds", type),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as Background;
              switch (type) {
                case "homeBg":
                  setHomeBgUrl(data.url || null);
                  break;
                case "startBg":
                  setStartBgUrl(data.url || null);
                  break;
                case "voucherBg":
                  setVoucherBgUrl(data.url || null);
                  break;
                case "succeedBg":
                  setSucceedBgUrl(data.url || null);
                  break;
                case "qrisBg":
                  setQrisBgUrl(data.url || null);
                  break;
              }
            }
          },
          (error) => {
            console.error(`Error with Firestore onSnapshot (${type}):`, error);
            notification.error({
              message: "Real-time sync error",
              description: `Could not sync ${type} background.`,
            });
          }
        )
      );

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }, [userId, boothId]);

  if (identityLoading || loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin tip="Loading backgrounds..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      <Title level={2}>Backgrounds</Title>
      <TypographyText type="secondary">Booth ID: {boothId}</TypographyText>

      {/* HomeBg Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Home Background</Title>
        <Avatar
          size={200}
          src={homeBgUrl}
          icon={!homeBgUrl && <UploadOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={handleUploadHomeBg}
          showUploadList={false}
          accept="image/png, image/jpeg, image/gif"
        >
          <Button icon={<UploadOutlined />}>Upload Home Background</Button>
        </Upload>
      </Card>

      {/* StartBg Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Start Background</Title>
        <Avatar
          size={200}
          src={startBgUrl}
          icon={!startBgUrl && <UploadOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={handleUploadStartBg}
          showUploadList={false}
          accept="image/png, image/jpeg, image/gif"
        >
          <Button icon={<UploadOutlined />}>Upload Start Background</Button>
        </Upload>
      </Card>

      {/* VoucherBg Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Voucher Background</Title>
        <Avatar
          size={200}
          src={voucherBgUrl}
          icon={!voucherBgUrl && <UploadOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={handleUploadVoucherBg}
          showUploadList={false}
          accept="image/png, image/jpeg, image/gif"
        >
          <Button icon={<UploadOutlined />}>Upload Voucher Background</Button>
        </Upload>
      </Card>

      {/* SucceedBg Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Succeed Background</Title>
        <Avatar
          size={200}
          src={succeedBgUrl}
          icon={!succeedBgUrl && <UploadOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={handleUploadSucceedBg}
          showUploadList={false}
          accept="image/png, image/jpeg, image/gif"
        >
          <Button icon={<UploadOutlined />}>Upload Succeed Background</Button>
        </Upload>
      </Card>

      {/* QRISBg Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>QRIS Background</Title>
        <Avatar
          size={200}
          src={qrisBgUrl}
          icon={!qrisBgUrl && <UploadOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={handleUploadQrisBg}
          showUploadList={false}
          accept="image/png, image/jpeg, image/gif"
        >
          <Button icon={<UploadOutlined />}>Upload QRIS Background</Button>
        </Upload>
      </Card>
    </div>
  );
};

export default BoothBackgroundsPage;