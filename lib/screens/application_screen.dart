import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class ApplicationScreen extends StatefulWidget {
  const ApplicationScreen({super.key});

  @override
  State<ApplicationScreen> createState() => _ApplicationScreenState();
}

class _ApplicationScreenState extends State<ApplicationScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _applications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchApplications();
  }

  Future<void> _fetchApplications() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final data = await _apiService.get('/applications/my-applications', token: token);
    if (mounted) {
      setState(() {
        _applications = data ?? [];
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _applications.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _applications.length,
                  itemBuilder: (context, index) {
                    final app = _applications[index];
                    return _buildApplicationCard(app);
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          const Text('No applications yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 8),
          const Text('Start applying for jobs to see them here!', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildApplicationCard(dynamic app) {
    final job = app['Job'] ?? {};
    final status = app['status'] ?? 'applied';
    
    Color statusColor;
    switch (status) {
      case 'applied': statusColor = Colors.blue; break;
      case 'reviewed': statusColor = Colors.orange; break;
      case 'interview': statusColor = Colors.purple; break;
      case 'offered': statusColor = Colors.green; break;
      case 'rejected': statusColor = Colors.red; break;
      default: statusColor = Colors.grey;
    }

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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(job['title'] ?? 'Job Title', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text(job['Employer']?['companyName'] ?? 'Company', style: TextStyle(color: Colors.grey[600])),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status.toUpperCase(),
                    style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            if (app['notes'] != null && app['notes'].toString().isNotEmpty) ...[
              const Text('Your Note:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.indigo)),
              const SizedBox(height: 4),
              Text(app['notes'], style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: Colors.black87)),
              const SizedBox(height: 12),
            ],
            Row(
              children: [
                Icon(Icons.calendar_today, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 6),
                Text('Applied on: ${app['appliedAt'] != null ? app['appliedAt'].toString().split('T')[0] : 'Today'}', 
                  style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
