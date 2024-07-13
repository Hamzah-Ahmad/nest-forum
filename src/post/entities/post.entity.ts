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
import { PostImage } from './postImage.entity';
import { Comment } from '../../comment/entities/comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  body: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  images: PostImage[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
