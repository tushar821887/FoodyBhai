import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BlogService, BlogPost } from '../../services/blog.service';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class Blog implements OnInit {
  posts: BlogPost[] = [];
  
  private blogService = inject(BlogService);
  private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit() {
    this.title.setTitle('Foody Bhai Blog | Insights on Food, Spices & Cloud Kitchens');
    this.meta.updateTag({ name: 'description', content: 'Read our latest articles on Indian cuisine, the health benefits of spices, and behind-the-scenes at Foody Bhai.' });
    
    this.blogService.getPosts().subscribe(posts => {
      this.posts = posts;
    });
  }
}
