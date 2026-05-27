import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/job_card.dart';
import '../services/api_service.dart';
import 'profile_screen.dart';
import 'application_screen.dart';
import 'employer_jobs_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final bool isEmployer = user?.role == 'employer';

    final List<Widget> screens = [
      isEmployer ? const EmployerJobsScreen() : JobListPage(key: UniqueKey()),
      const ApplicationScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.indigo,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
            icon: Icon(isEmployer ? Icons.list_alt : Icons.work_outline), 
            activeIcon: Icon(isEmployer ? Icons.list : Icons.work), 
            label: isEmployer ? 'Manage' : 'Applications'
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class JobListPage extends StatefulWidget {
  const JobListPage({super.key});

  @override
  State<JobListPage> createState() => _JobListPageState();
}

class _JobListPageState extends State<JobListPage> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _allJobs = [];
  List<dynamic> _filteredJobs = [];
  bool _isLoading = true;
  String _selectedCategory = 'All Jobs';

  @override
  void initState() {
    super.initState();
    _fetchJobs();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchJobs() async {
    final jobs = await _apiService.get('/jobs');
    if (mounted) {
      setState(() {
        _allJobs = jobs ?? [];
        _filteredJobs = _allJobs;
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    setState(() {
      final query = _searchController.text.toLowerCase();
      
      _filteredJobs = _allJobs.where((job) {
        // 1. Category Filter
        final String jobCategory = (job['category'] ?? '').toString().toLowerCase();
        final String selectedCat = _selectedCategory.toLowerCase();
        final bool matchesCategory = (_selectedCategory == 'All Jobs' || jobCategory == selectedCat || jobCategory.contains(selectedCat));

        // 2. Search Query Filter
        final String title = (job['title'] ?? '').toString().toLowerCase();
        final String company = (job['Employer']?['companyName'] ?? '').toString().toLowerCase();
        final bool matchesSearch = (query.isEmpty || title.contains(query) || company.contains(query));

        return matchesCategory && matchesSearch;
      }).toList();
    });
  }

  void _filterByCategory(String category) {
    _selectedCategory = category;
    _applyFilters();
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 180.0,
          floating: false,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            title: const Text('Find Your Future', 
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            background: Stack(
              fit: StackFit.expand,
              children: [
                Image.network(
                  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                  fit: BoxFit.cover,
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.white),
              onPressed: () {
                Provider.of<AuthProvider>(context, listen: false).logout();
                Navigator.pushReplacementNamed(context, '/');
              },
            ),
          ],
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, ${user?.firstName ?? 'User'}! 👋',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const Text('Discover the best jobs and internships.', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
                TextField(
                  controller: _searchController,
                  onChanged: (val) => _applyFilters(),
                  decoration: InputDecoration(
                    hintText: 'Search for jobs, companies...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty 
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            _applyFilters();
                          },
                        )
                      : null,
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Categories',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 45,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildCategoryChip('All Jobs', Colors.indigo, _selectedCategory == 'All Jobs'),
                      _buildCategoryChip('Technology', Colors.blue, _selectedCategory == 'Technology'),
                      _buildCategoryChip('Finance', Colors.green, _selectedCategory == 'Finance'),
                      _buildCategoryChip('Design', Colors.purple, _selectedCategory == 'Design'),
                      _buildCategoryChip('Marketing', Colors.orange, _selectedCategory == 'Marketing'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Recommended for You',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
        _isLoading
            ? const SliverToBoxAdapter(child: Center(child: Padding(
                padding: EdgeInsets.all(32.0),
                child: CircularProgressIndicator(),
              )))
            : SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => JobCard(job: _filteredJobs[index]),
                    childCount: _filteredJobs.length,
                  ),
                ),
              ),
        if (!_isLoading && _filteredJobs.isEmpty)
          const SliverToBoxAdapter(
            child: Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Text('No jobs found at the moment.', style: TextStyle(color: Colors.grey)),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildCategoryChip(String label, Color color, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      child: FilterChip(
        label: Text(label),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
        selected: isSelected,
        onSelected: (bool value) {
          if (value) _filterByCategory(label);
        },
        backgroundColor: color.withOpacity(0.1),
        selectedColor: color,
        checkmarkColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
    );
  }
}
