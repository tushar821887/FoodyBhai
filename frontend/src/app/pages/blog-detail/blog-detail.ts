import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService, BlogPost } from '../../services/blog.service';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
  encapsulation: ViewEncapsulation.None
})
export class BlogDetail implements OnInit {
  post: BlogPost | undefined;
  safeContent: SafeHtml = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private blogService = inject(BlogService);
  private meta = inject(Meta);
  private title = inject(Title);
  private sanitizer = inject(DomSanitizer);

  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/blog']);
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.blogService.getPostBySlug(slug).subscribe(post => {
          this.post = post;
          if (post) {
            this.title.setTitle(`${post.title} | Foody Bhai Blog`);
            this.meta.updateTag({ name: 'description', content: post.excerpt });
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content);
          }
        });
      }
    });
  }
}
