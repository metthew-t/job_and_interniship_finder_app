import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'post_job_screen.dart';
import 'job_applications_screen.dart';

class EmployerJobsScreen extends StatefulWidget {
  const EmployerJobsScreen({super.key});

  @override
  State<EmployerJobsScreen> createState() => _EmployerJobsScreenState();
}

class _EmployerJobsScreenState extends State<EmployerJobsScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _myJobs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMyJobs();
  }

  Future<void> _fetchMyJobs() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final response = await _apiService.get('/jobs/my-jobs', token: token);
    if (mounted) {
      setState(() {
        _myJobs = response ?? [];
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteJob(int jobId) async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final response = await _apiService.delete('/jobs/$jobId', token: token);
    
    if (response != null) {
      _fetchMyJobs();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Listing removed successfully')),
        );
      }
    }
  }

  void _showDeleteDialog(int jobId, String title) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Listing?'),
        content: Text('Are you sure you want to remove "$title"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteJob(jobId);
            }, 
            child: const Text('Remove', style: TextStyle(color: Colors.red))
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Employer Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).logout();
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchMyJobs,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Your Active Listings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Expanded(
                      child: _myJobs.isEmpty
                          ? _buildEmptyState()
                          : ListView.builder(
                              itemCount: _myJobs.length,
                              itemBuilder: (context, index) {
                                final job = _myJobs[index];
                                return _buildJobItem(job);
                              },
                            ),
                    ),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const PostJobScreen()),
          );
          if (result == true) _fetchMyJobs();
        },
        icon: const Icon(Icons.add),
        label: const Text('Post Job'),
        backgroundColor: Colors.indigo,
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_business_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          const Text('No jobs posted yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildJobItem(dynamic job) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      elevation: 0,
      color: Colors.grey[50],
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    job['title'] ?? 'Job Title',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                  onPressed: () => _showDeleteDialog(job['id'], job['title']),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.indigo.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    job['jobType'] ?? 'Full-time',
                    style: const TextStyle(color: Colors.indigo, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 8),
                Text(job['category'] ?? 'Tech', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
            const Divider(height: 24),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 12, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  'Created: ${job['createdAt'].toString().split('T')[0]}',
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => JobApplicationsScreen(job: job)),
                    );
                  },
                  icon: const Icon(Icons.people_outline, size: 18),
                  label: const Text('Applicants'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
