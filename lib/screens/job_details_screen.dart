import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class JobDetailsScreen extends StatefulWidget {
  final dynamic job;
  const JobDetailsScreen({super.key, required this.job});

  @override
  State<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends State<JobDetailsScreen> {
  bool _isApplying = false;
  final ApiService _apiService = ApiService();

  void _apply() async {
    setState(() => _isApplying = true);
    final response = await _apiService.post('/applications', {
      'jobId': widget.job['id'],
    }, token: Provider.of<AuthProvider>(context, listen: false).token);
    
    setState(() => _isApplying = false);

    if (response != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Application Submitted Successfully!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to apply. Check profile completion.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.job['title'])),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.job['Employer']?['companyName'] ?? '', style: const TextStyle(fontSize: 20, color: Colors.indigo)),
            const SizedBox(height: 16),
            const Text('Job Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(widget.job['description'] ?? 'No description provided'),
            const SizedBox(height: 24),
            const Text('Requirements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(widget.job['requirements'] ?? 'No requirements listed'),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isApplying ? null : _apply,
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
              child: _isApplying ? const CircularProgressIndicator() : const Text('Apply Now'),
            ),
          ],
        ),
      ),
    );
  }
}
