import React, { FC, useState, useEffect } from "react";
import { Menu } from "antd";
import Button from "../../atoms/buttons/button";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import { googleLogin, googleLogout } from "@/pages/api/firebaseLogin";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

interface NavbarProps {
  defaultSelectedKeys: string[];
  items: { key: string; label: string }[];
}

const Navbar: FC<NavbarProps> = ({ defaultSelectedKeys, items }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const user = await googleLogin();
      if (user) {
        setUser(user);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  const handleGoogleLogout = async (): Promise<void> => {
    try {
      await googleLogout();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error during Google logout:", error);
    }
  };

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoContainer}>
        <span className={styles.logo}>Retro</span>
        <span className={styles.logo}>spect</span>
      </div>
      <Menu
        className={styles.menu}
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={defaultSelectedKeys}
        items={items}
        style={{ flex: 1, minWidth: 0 }}
      />

      <div className={styles.rightSection}>
        <div className={styles.contactInfo}>
          <MailOutlined />
          <PhoneOutlined />
        </div>

        {user ? (
          <>
            <Button
              htmlType="button"
              icon={<DashboardOutlined />}
              onClick={() => router.push("/dashboard")}
              className={styles.dashboardButton}
              text=""
            />
            <Button
              htmlType="button"
              icon={<LogoutOutlined />}
              onClick={handleGoogleLogout}
              className={styles.logoutButton}
              text=""
            />
          </>
        ) : (
          <Button
            htmlType="button"
            icon={<UserOutlined />}
            onClick={handleGoogleLogin}
            className={styles.loginButton}
            text="Login"
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
