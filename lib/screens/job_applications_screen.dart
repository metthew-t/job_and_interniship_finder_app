import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class JobApplicationsScreen extends StatefulWidget {
  final dynamic job;
  const JobApplicationsScreen({super.key, required this.job});

  @override
  State<JobApplicationsScreen> createState() => _JobApplicationsScreenState();
}

class _JobApplicationsScreenState extends State<JobApplicationsScreen> {
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
    final response = await _apiService.get('/applications/job/${widget.job['id']}', token: token);
    if (mounted) {
      setState(() {
        _applications = response ?? [];
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Applications for ${widget.job['title']}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _applications.isEmpty
              ? const Center(child: Text('No applications yet.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _applications.length,
                  itemBuilder: (context, index) {
                    final app = _applications[index];
                    final user = app['User'] ?? {};
                    final profile = user['profile'] ?? {};
                    return _buildApplicationCard(app, user, profile);
                  },
                ),
    );
  }

  Widget _buildApplicationCard(dynamic app, dynamic user, dynamic profile) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(child: Icon(Icons.person)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${user['firstName']} ${user['lastName']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text(user['email'], style: TextStyle(color: Colors.grey[600])),
                    ],
                  ),
                ),
                _buildStatusBadge(app['status']),
              ],
            ),
            const Divider(height: 32),
            if (profile['university'] != null)
              _buildInfoRow(Icons.school, 'University: ${profile['university']}'),
            if (profile['courseOfStudy'] != null)
              _buildInfoRow(Icons.book, 'Course: ${profile['courseOfStudy']}'),
            if (app['notes'] != null && app['notes'].toString().isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Applicant Note:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.indigo)),
              const SizedBox(height: 4),
              Text(app['notes'], style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic)),
            ],
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Logic to view full profile or contact
              },
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 40)),
              child: const Text('View Full Profile'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.indigo.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(status.toUpperCase(), style: const TextStyle(color: Colors.indigo, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: TextStyle(color: Colors.grey[700]))),
        ],
      ),
    );
  }
}
