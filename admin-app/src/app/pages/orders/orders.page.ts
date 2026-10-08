import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStatusPipe } from '../../pipes/filter-status.pipe';
import { FormsModule } from '@angular/forms';
import { ApiService, Order } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterStatusPipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.css'
})
export class OrdersPage implements OnInit, OnDestroy {
  currentUser: any = null;
  isAgent = false;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  currentTab: string = 'pending';
  currentView: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users' = 'dashboard';
  menuTab: 'categories' | 'items' | 'mapping' = 'categories';
  
  categories: any[] = [];
  recipes: any[] = [];
  restaurantStats: any = { averageRating: 0, totalReviews: 0 };
  
  // Menu Category Form
  newCategoryName = '';
  newCategoryDesc = '';
  
  // Menu Item Form
  newItem = {
    title: '',
    slug: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    isVeg: true
  };
  
  // Mapping
  selectedMappingCategory = '';
  
  // Edit State
  editingCategory: any = null;
  
  editingRecipe: any = null;
  showEditRecipeModal = false;
  
  users: any[] = [];
  editingUser: any = null;
  showAddUserModal = false;
  newUser: any = { name: '', email: '', password: '', phone: '', role: 'user' };
  showEditUserModal = false;
  agents: any[] = [];
  newAgentName = '';
  newAgentPhone = '';
  newAgentEmail = '';
  newAgentPassword = '';
  isAddingAgent = false;
  
  // Settings
  upiId: string = 'foodybhai@okaxis';
  restaurantOpen = true;
  restaurantClosedReason = 'We are currently closed. Please check back later.';
  qrImageUrl: string = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

  // Payment Modal
  showPaymentModal = false;
  orderToDeliver: any = null;
  selectedPaymentMethod: 'cod' | 'online' = 'cod';
  cashReceived: boolean = false;
  showAssignModal = false;
  selectedAgent: any = null;
  orderToAssign: string | null = null;
  
  prepTimeInput: number = 15;
  selectedOrderId: string | null = null;
  showPrepModal = false;

  private pollInterval: any;
  private ringAudio: HTMLAudioElement | null = null;
  private isRinging = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.currentUser = this.api.getCurrentUser();
    if (this.currentUser && this.currentUser.role === 'agent') {
      this.isAgent = true;
    }
    try {
      this.ringAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      this.ringAudio.loop = true;
    } catch(e) {}

    this.fetchOrders();
    this.pollInterval = setInterval(() => this.fetchOrders(), 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.stopRinging();
  }

  fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        const pendingCount = data.filter(o => o.status === 'pending').length;
        
        if (pendingCount > 0 && !this.isRinging) {
          this.startRinging();
        } else if (pendingCount === 0 && this.isRinging) {
          this.stopRinging();
        }
        
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
    
    // Fetch live ratings
    this.api.getRestaurantStats().subscribe({
      next: (stats: any) => {
        this.restaurantStats = stats;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to fetch stats', err)
    });
  }

  startRinging() {
    if (!this.ringAudio) return;
    this.isRinging = true;
    const playPromise = this.ringAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Autoplay blocked. Click anywhere to allow audio.');
        this.isRinging = false; // Reset so it can try again next tick if user clicked
      });
    }
  }

  stopRinging() {
    if (!this.ringAudio) return;
    this.isRinging = false;
    this.ringAudio.pause();
    this.ringAudio.currentTime = 0;
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.filterOrders();
  }

  get activeOrdersCount() {
    return this.orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length;
  }

  filterOrders() {
    if (this.currentTab === 'pending') {
      this.filteredOrders = this.orders.filter(o => o.status === 'pending');
    } else if (this.currentTab === 'preparing') {
      this.filteredOrders = this.orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status));
    } else {
      this.filteredOrders = this.orders.filter(o => ['delivered', 'cancelled', 'rejected'].includes(o.status));
    }
  }

  
  setView(view: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users') {
    this.currentView = view;
    if (view === 'menu') {
      this.fetchCategories();
      this.fetchRecipes();
    }
    if (view === 'settings') {
      this.api.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value) this.upiId = res.value; });
      this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value) this.qrImageUrl = res.value; });
      this.api.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true; });
      this.api.getSetting('restaurant_closed_reason').subscribe(res => { if (res && res.value) this.restaurantClosedReason = res.value; });
      
      
    }
    if (view === 'agents') {
      this.fetchAgents();
    }
    if (view === 'users') {
      this.fetchUsers();
    }
  }

  fetchUsers() {
    this.api.getUsers().subscribe(data => {
      this.users = data;
      this.cdr.detectChanges();
    });
  }

  addUser() {
    if(!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      alert('Name, Email, and Password are required');
      return;
    }
    this.api.createUser(this.newUser).subscribe({
      next: () => {
        this.showAddUserModal = false;
        this.newUser = { name: '', email: '', password: '', phone: '', role: 'user' };
        this.fetchUsers();
      },
      error: (err) => alert(err.error?.message || 'Failed to create user')
    });
  }

  editUser(user: any) {
    this.editingUser = { ...user, password: '' };
    this.showEditUserModal = true;
  }

  saveUserEdit() {
    if(!this.editingUser) return;
    const updateData: any = {
      name: this.editingUser.name,
      email: this.editingUser.email,
      phone: this.editingUser.phone,
      role: this.editingUser.role
    };
    if (this.editingUser.password) {
      updateData.password = this.editingUser.password;
    }
    
    this.api.updateUser(this.editingUser._id || this.editingUser.id, updateData).subscribe(() => {
      this.showEditUserModal = false;
      this.editingUser = null;
      this.fetchUsers();
    });
  }

  deleteUser(id: string) {
    if(confirm('Delete this user?')) {
      this.api.deleteUser(id).subscribe(() => this.fetchUsers());
    }
  }

  fetchAgents() {
    this.api.getAgents().subscribe(data => this.agents = data);
  }

  addAgent() {
    if(!this.newAgentName || !this.newAgentPhone) return;
    this.isAddingAgent = true;
    this.api.addAgent(this.newAgentName, this.newAgentPhone, this.newAgentEmail, this.newAgentPassword).subscribe({
      next: () => {
        this.newAgentName = '';
        this.newAgentPhone = '';
        this.newAgentEmail = '';
        this.newAgentPassword = '';
        this.isAddingAgent = false;
        this.fetchAgents();
      },
      error: () => this.isAddingAgent = false
    });
  }

  editingAgent: any = null;
  showEditAgentModal = false;

  editAgent(agent: any) {
    this.editingAgent = { ...agent, password: '' };
    this.showEditAgentModal = true;
  }

  saveAgentEdit() {
    if(!this.editingAgent) return;
    this.api.updateAgent(
      this.editingAgent._id || this.editingAgent.id,
      this.editingAgent.name,
      this.editingAgent.phone,
      this.editingAgent.email,
      this.editingAgent.password
    ).subscribe(() => {
      this.showEditAgentModal = false;
      this.editingAgent = null;
      this.fetchAgents();
    });
  }

  deleteAgent(id: string) {
    if(confirm('Delete this agent?')) {
      this.api.deleteAgent(id).subscribe(() => this.fetchAgents());
    }
  }

  
  openAssignAgentModal(orderId: string) {
    this.orderToAssign = orderId;
    this.selectedAgent = null;
    this.showAssignModal = true;
    if (this.agents.length === 0) {
      this.fetchAgents();
    }
  }

  assignAgent(agent: any) {
    this.selectedAgent = agent;
  }

  confirmOutForDelivery() {
    if (!this.orderToAssign || !this.selectedAgent) return;
    this.api.updateOrderStatus(this.orderToAssign, 'out_for_delivery', undefined, {
      name: this.selectedAgent.name,
      phone: this.selectedAgent.phone
    }).subscribe(() => {
      this.showAssignModal = false;
      this.fetchOrders();
    });
  }

  
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.qrImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  
  setMenuTab(tab: 'categories' | 'items' | 'mapping') {
    this.menuTab = tab;
  }

  fetchCategories() {
    this.api.getCategories().subscribe(res => this.categories = res);
  }

  addCategory() {
    if(!this.newCategoryName) return;
    this.api.addCategory(this.newCategoryName, this.newCategoryDesc).subscribe(() => {
      this.newCategoryName = '';
      this.newCategoryDesc = '';
      this.fetchCategories();
    });
  }

  editCategory(cat: any) {
    this.editingCategory = { ...cat };
  }

  saveCategoryEdit() {
    if(!this.editingCategory) return;
    this.api.updateCategory(this.editingCategory.id, this.editingCategory.name, this.editingCategory.description).subscribe(() => {
      this.editingCategory = null;
      this.fetchCategories();
    });
  }

  getItemCount(categoryName: string): number {
    return this.recipes.filter(r => r.category === categoryName).length;
  }

  deleteCategory(id: string) {
    if(confirm('Delete this category?')) {
      this.api.deleteCategory(id).subscribe(() => this.fetchCategories());
    }
  }

  fetchRecipes() {
    this.api.getRecipes().subscribe(res => this.recipes = res);
  }

  addRecipe() {
    if(!this.newItem.title || !this.newItem.price || !this.newItem.description) {
      alert('Please fill out Title, Price, and Description');
      return;
    }
    this.newItem.slug = this.newItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.api.addRecipe(this.newItem).subscribe(() => {
      this.newItem = { title: '', slug: '', price: 0, category: '', description: '', image: '', isVeg: true };
      this.fetchRecipes();
      alert('Item added successfully');
    });
  }

  editRecipe(recipe: any) {
    this.editingRecipe = { ...recipe };
    this.showEditRecipeModal = true;
  }

  saveRecipeEdit() {
    if(!this.editingRecipe) return;
    this.api.updateRecipe(this.editingRecipe.id || this.editingRecipe._id, this.editingRecipe).subscribe(() => {
      this.showEditRecipeModal = false;
      this.editingRecipe = null;
      this.fetchRecipes();
    });
  }

  deleteRecipe(id: string) {
    if(confirm('Delete this item?')) {
      this.api.deleteRecipe(id).subscribe(() => this.fetchRecipes());
    }
  }

  updateRecipeCategory(recipeId: string, newCategory: string) {
    this.api.updateRecipe(recipeId, { category: newCategory }).subscribe(() => {
      this.fetchRecipes();
    });
  }

  saveSettings() {
    this.api.saveSetting('foodybhai_upi', this.upiId).subscribe();
    this.api.saveSetting('foodybhai_qr', this.qrImageUrl).subscribe(() => alert('Settings saved successfully!'));
    
  }

  openPaymentModal(order: any) {
    this.orderToDeliver = order;
    this.selectedPaymentMethod = order.paymentMethod === 'online' ? 'online' : 'cod';
    this.cashReceived = false;
    this.showPaymentModal = true;
  }

  confirmDelivery() {
    if (!this.orderToDeliver) return;
    
    // In a real app, we'd also hit an endpoint to update paymentStatus to 'paid'
    // But our updateOrderStatus endpoint currently only accepts status, preparationTime, deliveryAgent.
    // Let's just update the status to delivered. The order is assumed paid if delivered.
    
    this.api.updateOrderStatus(this.orderToDeliver._id, 'delivered').subscribe(() => {
      this.showPaymentModal = false;
      this.fetchOrders();
    });
  }

  logout() {
    this.api.logout();
    window.location.href = '/login';
  }

  openAcceptModal(orderId: string) {
    this.selectedOrderId = orderId;
    this.prepTimeInput = 15;
    this.showPrepModal = true;
  }

  acceptOrder() {
    if (!this.selectedOrderId) return;
    this.api.updateOrderStatus(this.selectedOrderId, 'preparing', this.prepTimeInput).subscribe(() => {
      this.showPrepModal = false;
      this.fetchOrders();
    });
  }

  rejectOrder(orderId: string) {
    if(confirm('Are you sure you want to reject this order?')) {
      this.api.updateOrderStatus(orderId, 'rejected').subscribe(() => this.fetchOrders());
    }
  }

  updateStatus(orderId: string, status: string) {
    this.api.updateOrderStatus(orderId, status).subscribe(() => this.fetchOrders());
  }

  getStatusBadge(status: string) {
    const map: any = {
      pending: { label: 'New', color: '#e74c3c' },
      preparing: { label: 'Preparing', color: '#f39c12' },
      ready: { label: 'Ready', color: '#27ae60' },
      out_for_delivery: { label: 'Out for Delivery', color: '#2980b9' },
      delivered: { label: 'Delivered', color: '#7f8c8d' },
      rejected: { label: 'Rejected', color: '#c0392b' }
    };
    return map[status] || { label: status, color: '#95a5a6' };
  }
}
