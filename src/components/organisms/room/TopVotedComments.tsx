import React, { useState, useEffect } from "react";
import { Row, Col, Card, List, Button } from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import styles from "./index.module.scss";

interface Comment {
  id: string;
  message: string;
  likes: number;
  dislikes: number;
  step_id: string;
}

interface CommentGroup {
  id: string;
  comments: string[];
  total_likes: number;
  total_dislikes: number;
}

const TopVotedComments: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [topComments, setTopComments] = useState<Comment[]>([]);
  const [topGroups, setTopGroups] = useState<CommentGroup[]>([]);

  useEffect(() => {
    const fetchTopCommentsAndGroups = async () => {
      const commentsQuery = query(
        collection(db, "comments"),
        where("room_id", "==", roomId)
      );
      const groupsQuery = query(
        collection(db, "comment_groups"),
        where("room_id", "==", roomId)
      );

      const commentsSnapshot = await getDocs(commentsQuery);
      const groupsSnapshot = await getDocs(groupsQuery);

      const allComments: Comment[] = [];
      const allGroups: CommentGroup[] = [];

      commentsSnapshot.forEach((doc) => {
        const data = doc.data() as Comment;
        allComments.push(data);
      });

      for (const groupDoc of groupsSnapshot.docs) {
        const groupData = groupDoc.data() as CommentGroup;
        const groupComments: Comment[] = [];

        for (const commentId of groupData.comments) {
          const commentDoc = await getDoc(doc(db, "comments", commentId));
          if (commentDoc.exists()) {
            groupComments.push(commentDoc.data() as Comment);
          }
        }

        allGroups.push({
          ...groupData,
          comments: groupComments.map((c) => c.message),
        });
      }

      const topComments = allComments
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5);

      const topGroups = allGroups
        .sort((a, b) => b.total_likes - a.total_likes)
        .slice(0, 5);

      setTopComments(topComments);
      setTopGroups(topGroups);
    };

    fetchTopCommentsAndGroups();
  }, [roomId]);

  const renderComment = (
    comment: Comment | CommentGroup,
    index: number,
    isGroup: boolean
  ) => (
    <div className={styles.commentListItem}>
      <Col span={12} key={comment.id} style={{ marginBottom: "16px" }}>
        <Card
          className={isGroup ? styles.commentCard : styles.singleCommentCard}
          actions={
            isGroup
              ? [
                  <Button icon={<LikeOutlined />}>
                    {(comment as CommentGroup).total_likes}
                  </Button>,
                  <Button icon={<DislikeOutlined />}>
                    {(comment as CommentGroup).total_dislikes}
                  </Button>,
                ]
              : [
                  <Button icon={<LikeOutlined />}>
                    {(comment as Comment).likes}
                  </Button>,
                  <Button icon={<DislikeOutlined />}>
                    {(comment as Comment).dislikes}
                  </Button>,
                ]
          }
        >
          {isGroup ? (
            (comment as CommentGroup).comments.map((message, index) => (
              <div
                key={index}
                className={`${styles.groupedComment} ${
                  index === 0 ? styles.groupedCommentActive : ""
                }`}
              >
                {message}
              </div>
            ))
          ) : (
            <div className={styles.groupedComment}>
              {(comment as Comment).message}
            </div>
          )}
        </Card>
      </Col>
    </div>
  );

  return (
    <div>
      <h2>Top Voted Comments and Groups</h2>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <h4>Top Voted Comments</h4>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={topComments}
            renderItem={(comment, index) =>
              renderComment(comment, index, false)
            }
          />
        </Col>
        <Col span={12}>
          <h3>Top Voted Comment Groups</h3>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={topGroups}
            renderItem={(group, index) => renderComment(group, index, true)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TopVotedComments;
