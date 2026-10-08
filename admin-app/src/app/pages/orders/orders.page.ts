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
  notifiedOrderIds = new Set<string>();
  notifiedCancelResolutions = new Set<string>();
  
  getMapUrl(order: any) {
    const origin = encodeURIComponent('127, Bhatwara, Meerut - 250002');
    const destination = encodeURIComponent(order.deliveryDetails.address);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }
  currentUser: any = null;
  isAgent = false;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  baseOrders: Order[] = [];
  currentTab: string = 'pending';
  currentView: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users' = 'dashboard';
  menuTab: 'categories' | 'items' | 'mapping' = 'categories';
  
  showCancelModal = false;
  cancelReason = '';
  orderToCancel: string | null = null;

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
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
    try {
      this.ringAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      this.ringAudio.loop = true;
    } catch(e) {}

    this.api.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true; });
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
        this.baseOrders = this.orders;
        if (this.isAgent) {
           this.baseOrders = this.orders.filter(o => o.deliveryAgent && (o.deliveryAgent.phone === this.currentUser.phone));
        }
        this.filterOrders();
        
        if (this.isAgent) {
           const myOrders = data.filter(o => o.status === 'out_for_delivery' && o.deliveryAgent && o.deliveryAgent.phone === this.currentUser.phone);
           myOrders.forEach(o => {
             if (!this.notifiedOrderIds.has(o._id)) {
               this.notifiedOrderIds.add(o._id);
               if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                 new Notification('New Delivery Assigned!', {
                   body: `Order #${o._id.slice(-6).toUpperCase()} to ${o.deliveryDetails.address}`,
                 });
                 this.startRinging();
                 setTimeout(() => this.stopRinging(), 4000);
               }
             }
           });

           const myResolvedCancels = data.filter(o => o.deliveryAgent && o.deliveryAgent.phone === this.currentUser.phone && o.cancelRequest && o.cancelRequest.status !== 'pending');
           myResolvedCancels.forEach(o => {
             const key = o._id + '-' + o.cancelRequest?.status;
             if (!this.notifiedCancelResolutions.has(key)) {
               this.notifiedCancelResolutions.add(key);
               if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                 const resolution = o.cancelRequest?.status === 'approved' ? 'Approved' : 'Rejected';
                 new Notification(`Cancel Request ${resolution}!`, {
                   body: `Your cancellation request for Order #${o._id.slice(-6).toUpperCase()} was ${resolution.toLowerCase()}.`,
                 });
               }
             }
           });
        }
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
    let baseOrders = this.baseOrders;
    return baseOrders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length;
  }

  filterOrders() {
    let baseOrders = this.orders;
    if (this.isAgent) {
       baseOrders = this.orders.filter(o => o.deliveryAgent && (o.deliveryAgent.phone === this.currentUser.phone));
    }
    
    if (this.currentTab === 'pending') {
      this.filteredOrders = baseOrders.filter(o => o.status === 'pending');
    } else if (this.currentTab === 'preparing') {
      this.filteredOrders = baseOrders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status));
    } else if (this.currentTab === 'cancelled') {
      this.filteredOrders = baseOrders.filter(o => ['cancelled', 'rejected'].includes(o.status));
    } else {
      this.filteredOrders = baseOrders.filter(o => o.status === 'delivered');
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

  adminRejectOrderId: string | null = null;
  adminRejectReason: string = '';
  showAdminRejectModal = false;

  rejectOrder(orderId: string) {
    this.adminRejectOrderId = orderId;
    this.adminRejectReason = '';
    this.showAdminRejectModal = true;
  }

  confirmAdminReject() {
    if (this.adminRejectOrderId && this.adminRejectReason.trim()) {
      this.api.updateOrderStatus(this.adminRejectOrderId, 'rejected', undefined, undefined, this.adminRejectReason.trim()).subscribe(() => {
        this.showAdminRejectModal = false;
        this.adminRejectOrderId = null;
        this.fetchOrders();
      });
    } else {
      alert('Please provide a reason for cancellation.');
    }
  }

  openCancelModal(orderId: string) {
    this.orderToCancel = orderId;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.orderToCancel = null;
    this.cancelReason = '';
  }

  submitCancelRequest() {
    if (this.orderToCancel && this.cancelReason.trim()) {
      this.api.requestCancelOrder(this.orderToCancel, this.cancelReason.trim()).subscribe(() => {
        alert('Cancellation request sent to admin.');
        this.closeCancelModal();
        this.fetchOrders();
      });
    }
  }

  requestCancel(orderId: string) {
    this.openCancelModal(orderId);
  }

  resolveCancel(orderId: string, approve: boolean) {
    if (confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this cancellation request?`)) {
      this.api.resolveCancelOrder(orderId, approve).subscribe(() => this.fetchOrders());
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


  toggleRestaurantStatus() {
    this.api.saveSetting('restaurant_open', this.restaurantOpen ? 'true' : 'false').subscribe();
  }

  get totalCompletedOrders() {
    return this.baseOrders.filter(o => o.status === 'delivered').length;
  }

  get totalPayoutAmount() {
    return this.baseOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  showAgentOrdersModal = false;
  selectedAgentOrders: any[] = [];
  selectedAgentForOrders: any = null;

  viewAgentOrders(agent: any) {
    this.selectedAgentForOrders = agent;
    this.selectedAgentOrders = this.baseOrders.filter(o => o.deliveryAgent && o.deliveryAgent.phone === agent.phone && o.status === 'delivered');
    this.showAgentOrdersModal = true;
  }

  getAgentDeliveryCount(agentPhone: string): number {
    return this.baseOrders.filter(o => o.deliveryAgent && o.deliveryAgent.phone === agentPhone && o.status === 'delivered').length;
  }

}
