import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  imageUrl: string;
  author: string;
  date: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private posts: BlogPost[] = [
    {
      id: 1,
      slug: 'history-of-paneer-butter-masala',
      title: 'The Rich History of Paneer Butter Masala',
      excerpt: 'Discover how Paneer Butter Masala became the king of North Indian vegetarian cuisine, its origins, and why it remains a favorite.',
      content: `
        <h2>The Origins of a Classic</h2>
        <p>Paneer Butter Masala, also known as Paneer Makhani, is arguably one of the most beloved vegetarian dishes in Indian cuisine. But where did this rich, creamy, and mildly sweet gravy originate? The story takes us back to the 1950s in Delhi, where the Moti Mahal restaurant was already famous for its Butter Chicken.</p>
        <p>As the demand for a vegetarian alternative to Butter Chicken grew, chefs began experimenting. They replaced the tandoori chicken pieces with soft, fresh paneer cubes. The sauce, made from fresh tomatoes, butter, and cream, proved to be the perfect base for the paneer. Thus, Paneer Butter Masala was born.</p>
        
        <h2>The Secret to the Perfect Makhani Gravy</h2>
        <p>The term 'Makhani' literally translates to 'buttery'. The foundation of this dish relies on a careful balance of tanginess from the tomatoes and the richness of butter and fresh cream. The slow-cooking process is vital. Tomatoes are simmered with whole spices like cardamom, cloves, and cinnamon, which infuse the sauce with a deep, aromatic profile.</p>
        <p>Unlike many other Indian curries, Paneer Butter Masala uses very little onion or garlic, and in many traditional recipes, none at all. The velvety texture is often achieved by adding cashew paste, which also balances the acidity of the tomatoes.</p>
        
        <h2>Why It Remains a Favorite</h2>
        <p>At Foody Bhai, Paneer Butter Masala is our most ordered dish. It appeals to all age groups because of its mild spice level. It pairs beautifully with garlic naan, butter tandoori roti, or even simple jeera rice. It's the centerpiece of Indian vegetarian dining, representing celebration, comfort, and culinary excellence.</p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc3?auto=format&fit=crop&w=800&q=80',
      author: 'Foody Bhai Kitchen',
      date: '2023-10-15',
      tags: ['History', 'Paneer', 'North Indian Cuisine']
    },
    {
      id: 2,
      slug: 'health-benefits-of-indian-spices',
      title: 'The Incredible Health Benefits of Traditional Indian Spices',
      excerpt: 'Turmeric, cumin, coriander—learn about the medicinal and health benefits of the spices we use every day.',
      content: `
        <h2>More Than Just Flavor</h2>
        <p>Indian cuisine is globally renowned for its complex flavor profiles, achieved through the masterful blending of spices. However, these spices are not just culinary agents; they have been the cornerstone of Ayurvedic medicine for thousands of years. Let's explore the health benefits of some everyday spices used in our kitchen.</p>
        
        <h2>Turmeric: The Golden Healer</h2>
        <p>Turmeric is perhaps the most famous of all Indian spices. Its active compound, curcumin, is a potent anti-inflammatory and antioxidant. Regular consumption of turmeric is linked to improved brain function, a lower risk of heart disease, and relief from arthritis symptoms. We use high-quality turmeric in almost all our gravies to give them that beautiful golden hue and health boost.</p>
        
        <h2>Cumin (Jeera): The Digestive Aid</h2>
        <p>Cumin seeds are a staple in the 'tadka' or tempering process. Cumin is incredibly beneficial for digestion. It increases the activity of digestive enzymes, potentially speeding up digestion. It is also a rich source of iron. Our famous Jeera Aloo and Jeera Rice highlight the earthy, warming flavor of cumin.</p>
        
        <h2>Coriander (D धनिया): The Cooling Spice</h2>
        <p>While often used in its fresh leaf form for garnishing, coriander seeds and powder are essential to Indian cooking. Coriander is known for its cooling properties. It helps lower blood sugar levels and is rich in immune-boosting antioxidants. It forms the base of many of our spice blends at Foody Bhai.</p>
        
        <h2>Conclusion</h2>
        <p>Every time you order a meal from Foody Bhai, you are not just treating your taste buds; you are consuming a blend of spices that have been carefully chosen for both their flavor and their health benefits.</p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      author: 'Foody Bhai Kitchen',
      date: '2023-10-22',
      tags: ['Health', 'Spices', 'Ayurveda']
    },
    {
      id: 3,
      slug: 'the-art-of-the-perfect-thali',
      title: 'The Art of the Perfect Indian Thali',
      excerpt: 'What makes a Thali the ultimate Indian dining experience? We break down the components of a perfectly balanced meal.',
      content: `
        <h2>A Feast on a Platter</h2>
        <p>The word 'Thali' translates to 'plate', but in Indian culinary terms, it signifies a complete meal made up of various dishes served on a single platter. The Thali is not just a way of eating; it is a philosophy of nutrition and flavor balance.</p>
        
        <h2>The Six Tastes of Ayurveda</h2>
        <p>A traditional Indian Thali is designed to incorporate the six tastes (Shadrasa) recognized in Ayurveda: sweet, salt, sour, pungent, bitter, and astringent. It is believed that a meal containing all six tastes ensures optimal digestion, satisfaction, and overall health.</p>
        
        <h2>Components of our Thali</h2>
        <p>At Foody Bhai, our Special Thalis are crafted with this balance in mind:</p>
        <ul>
          <li><strong>The Grain:</strong> Usually rice or flatbreads (Roti/Puri), providing essential carbohydrates for energy.</li>
          <li><strong>The Lentil:</strong> Dal Tadka or Dal Fry, providing the crucial protein component.</li>
          <li><strong>The Vegetables:</strong> A dry vegetable preparation (like Aloo Jeera or Mix Veg) offering vitamins and fiber.</li>
          <li><strong>The Gravy:</strong> A rich paneer dish providing fats, calcium, and deep satisfaction.</li>
          <li><strong>The Accompaniments:</strong> Raita (yogurt) for probiotics and cooling, salad for crunch, and a sweet dish to complete the meal.</li>
        </ul>
        
        <h2>Why Order a Thali?</h2>
        <p>A Thali offers variety without the need to order large portions of multiple individual dishes. It is the perfect solution for a single diner wanting a complete, wholesome, and varied meal. Experience our perfectly curated Thalis delivered hot to your door in Meerut!</p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      author: 'Foody Bhai Kitchen',
      date: '2023-11-05',
      tags: ['Thali', 'Nutrition', 'Indian Food']
    },
    {
      id: 4,
      slug: 'cloud-kitchens-future-of-dining',
      title: 'Why Cloud Kitchens are the Future of Food Delivery',
      excerpt: 'Foody Bhai operates entirely as a cloud kitchen. Learn what this means and how it benefits you as a customer.',
      content: `
        <h2>What is a Cloud Kitchen?</h2>
        <p>A cloud kitchen, also known as a ghost kitchen or dark kitchen, is a commercial cooking facility dedicated solely to preparing food for delivery or takeout. There is no dine-in area, no waitstaff, and no physical storefront for customers to eat in. Foody Bhai is proud to be one of Meerut's premier cloud kitchens.</p>
        
        <h2>The Focus is 100% on the Food</h2>
        <p>By eliminating the overhead costs associated with a traditional restaurant (expensive real estate, interior decor, front-of-house staff), we can channel all our resources into what truly matters: the food. We invest in top-quality ingredients, highly skilled chefs, and superior packaging.</p>
        
        <h2>Unmatched Hygiene and Efficiency</h2>
        <p>Traditional restaurant kitchens can be chaotic, balancing dine-in orders with delivery orders. In a cloud kitchen, the workflow is streamlined specifically for delivery. This means faster prep times and a hyper-focus on hygiene. Our kitchen operates with strict sanitation protocols to ensure your food is safe and clean.</p>
        
        <h2>Better Prices for Premium Quality</h2>
        <p>Because our operational costs are lower, we can offer premium, restaurant-quality food at more competitive prices. You get the luxury of a fine-dining meal in the comfort of your home, without paying the premium for the restaurant ambiance.</p>
        
        <h2>Conclusion</h2>
        <p>The cloud kitchen model allows us to innovate faster, maintain higher quality control, and deliver the best possible food to our customers in Meerut. When you order from Foody Bhai, you are experiencing the future of dining.</p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&w=800&q=80',
      author: 'Foody Bhai Kitchen',
      date: '2023-11-12',
      tags: ['Cloud Kitchen', 'Business', 'Delivery']
    },
    {
      id: 5,
      slug: 'essential-indian-breads',
      title: 'A Guide to Essential Indian Breads: Roti, Naan, and Paratha',
      excerpt: 'Confused by the different types of Indian flatbreads? Here is a quick guide to understanding the differences.',
      content: `
        <h2>The Foundation of the Meal</h2>
        <p>In North Indian cuisine, bread is not just a side dish; it is the utensil used to scoop up rich curries and flavorful dals. But with so many varieties, how do you choose? Here is a breakdown of the essential Indian breads we serve at Foody Bhai.</p>
        
        <h2>Tawa Roti (Chapati)</h2>
        <p>The everyday staple of the Indian diet. Roti is made from whole wheat flour (atta) and water, cooked on a flat skillet called a tawa. It is unleavened, healthy, and light. We serve it plain or generously brushed with ghee or butter. It pairs perfectly with everyday dishes like Dal Tadka and dry Sabzis.</p>
        
        <h2>Paratha</h2>
        <p>Parathas take the basic roti dough and elevate it through layering with ghee or oil, resulting in a flaky, slightly crispy texture. They can be plain or stuffed. Our Aloo Paratha (stuffed with spiced potatoes) and Paneer Paratha are meals in themselves, best enjoyed with a side of cool yogurt or pickle.</p>
        
        <h2>Puri</h2>
        <p>Puri is a festive, indulgent bread. Made from whole wheat flour, the dough is rolled into small discs and deep-fried until it puffs up like a balloon. It is soft, slightly crispy on the outside, and incredibly satisfying. Our Puri & Sabzi combos are a highly popular breakfast or weekend treat.</p>
        
        <h2>How to Choose?</h2>
        <p>For a light, everyday meal, go for Tawa Roti. For a rich, heavy gravy like Paneer Butter Masala, a layered Paratha works beautifully. And for a special treat or a classic Sunday brunch, you can't beat fresh Puris. Order now from Foody Bhai and taste the difference!</p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      author: 'Foody Bhai Kitchen',
      date: '2023-11-20',
      tags: ['Breads', 'Food Guide', 'North Indian']
    }
  ];

  getPosts(): Observable<BlogPost[]> {
    return of(this.posts);
  }

  getPostBySlug(slug: string): Observable<BlogPost | undefined> {
    return of(this.posts.find(p => p.slug === slug));
  }
}
