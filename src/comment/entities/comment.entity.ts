import { Post } from '../../post/entities/post.entity';
import { User } from '../../user/entities/User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  commentText: string;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  parent: Comment;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Comment, (comment) => comment.parent, {
    onDelete: 'CASCADE',
  })
  replies: Comment[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  replyCount: number;
}
