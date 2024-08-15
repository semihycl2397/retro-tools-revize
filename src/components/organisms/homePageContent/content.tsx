import React from "react";
import { Row, Col } from "antd";
import styles from "./index.module.scss";
import Buttons from "@/components/atoms/buttons/button";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const companies = [
  "https://cdn.webrazzi.com/uploads/2022/01/atmosware-logo-528.jpg",
  "https://ffo3gv1cf3ir.merlincdn.net/SiteAssets/Hakkimizda/genel-bakis/logolarimiz/TURKCELL_YATAY_ERKEK_LOGO.jpg",
  "https://ffo3gv1cf3ir.merlincdn.net/SiteAssets/Hakkimizda/genel-bakis/logolarimiz/AMBLEM_SARI.jpg",
  "https://cdn.webrazzi.com/uploads/2022/01/atmosware-logo-528.jpg",
  "https://ffo3gv1cf3ir.merlincdn.net/SiteAssets/Hakkimizda/genel-bakis/logolarimiz/TURKCELL_YATAY_ERKEK_LOGO.jpg",
  "https://ffo3gv1cf3ir.merlincdn.net/SiteAssets/Hakkimizda/genel-bakis/logolarimiz/AMBLEM_SARI.jpg",
];

const StatsSection = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };
  return (
    <>
      <div className={styles["company-logos-section"]}>
        <Slider {...settings}>
          {companies.map((logo, index) => (
            <div key={index} className={styles["logo-container"]}>
              <img
                src={logo}
                alt={`Company logo ${index + 1}`}
                className={styles["company-logo"]}
              />
            </div>
          ))}
        </Slider>
      </div>
      <div className={styles["stats-section"]}>
        <Row gutter={[16, 16]} align="middle" justify="center">
          <Col xs={24} sm={24} md={12} lg={8}>
            <div className={styles["image-container"]}>
              <img
                src="/two2.svg"
                alt="Image Description"
                className={styles["stats-image"]}
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={16}>
            <div className={styles["stats-info"]}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className={styles["stat"]}>
                    <h2>1500+</h2>
                    <p>Working hours</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles["stat"]}>
                    <h2>450+</h2>
                    <p>Technologies</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles["stat"]}>
                    <h2>20k</h2>
                    <p>Top developers</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles["stat"]}>
                    <h2>95%</h2>
                    <p>Clients engagements</p>
                  </div>
                </Col>
                <Col span={24}>
                  <p className={styles["description"]}>
                    With our retro approaches, we deliver impactful solutions in
                    boundary-pushing projects.
                  </p>
                </Col>
                <Col span={24}>
                  <Buttons htmlType="button" text="Get Started" />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
      <div className={styles["info-section"]}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div className={styles.content}>
              <h2>Innovative Solutions for Your Challenges.</h2>
              <p>
                With our Retro Tools application, you can create custom retro
                meeting templates tailored to your needs through dynamic steps.
              </p>
              <p>
                We enable you to personalize your meeting processes, ensuring a
                productive retrospective with your team members.
              </p>
              <p>
                Our dynamic steps allow you to design meetings that address the
                most critical aspects of your projects, ensuring that every
                session is both productive and insightful.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles["image-wrapper"]}>
              <img
                src="/content4.jpeg"
                alt="Challenge Illustration"
                className={styles.image}
              />
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div>
              <img
                src="/content1.jpeg"
                alt="Solution Illustration"
                className={styles.image}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles.content}>
              <h2>Track and Archive Your Meetings</h2>
              <p>
                Keeping track of past decisions and discussions is crucial for
                long-term success.
              </p>
              <p>
                Retro Tools offers a robust solution for archiving all your
                retrospective meetings.
              </p>
              <p>
                Every note, action item, and decision made during your meetings
                is securely stored, allowing you to easily revisit and review
                past sessions..
              </p>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div className={styles.content}>
              <h2>Export Your Meeting Notes as PDF</h2>
              <p>
                Not only do we store your meeting notes, but we also provide the
                option to export them as PDFs.
              </p>
              <p>
                This feature makes it easy to archive your meeting outcomes and
                access them whenever you need.
              </p>
              <p>
                This not only streamlines your workflow but also enhances the
                professionalism of your documentation.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles["image-wrapper"]}>
              <img
                src="/content3.jpeg"
                alt="Challenge Illustration"
                className={styles.image}
              />
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div>
              <img
                src="/content2.jpeg"
                alt="Solution Illustration"
                className={styles.image}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles.content}>
              <h2>Quick and Secure Login with Google</h2>
              <p>
                You can log in to Retro Tools quickly and securely using your
                Google account.
              </p>
              <p>
                This integration enhances your user experience while ensuring
                the highest level of security for your information.
              </p>
              <Buttons htmlType="button" text="Get Started"></Buttons>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default StatsSection;
