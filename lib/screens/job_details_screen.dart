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
  bool _isLoadingScore = true;
  Map<String, dynamic>? _aiScore;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _fetchAiScore();
  }

  Future<void> _fetchAiScore() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final response = await _apiService.get('/matching/score/${widget.job['id']}', token: token);
    if (mounted) {
      setState(() {
        _aiScore = response;
        _isLoadingScore = false;
      });
    }
  }

  void _apply(String notes) async {
    setState(() => _isApplying = true);
    final response = await _apiService.post('/applications', {
      'jobId': widget.job['id'],
      'notes': notes,
    }, token: Provider.of<AuthProvider>(context, listen: false).token);
    
    setState(() => _isApplying = false);

    if (response != null && response['error'] == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Application Submitted Successfully!')),
        );
      }
    } else {
      // Show actual error message if available
      final String msg = response?['message'] ?? 'Failed to apply. Check profile completion.';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg)),
        );
      }
    }
  }

  void _showApplyDialog() {
    final notesController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Apply for this Job', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Add a brief description or ideas to stand out.'),
            const SizedBox(height: 16),
            TextField(
              controller: notesController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'If you have any Descriptions or ideas...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _apply(notesController.text);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white),
            child: const Text('Submit Application'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: Colors.indigo,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircleAvatar(
                        radius: 40,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.business, size: 50, color: Colors.indigo),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        widget.job['Employer']?['companyName'] ?? 'Company',
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          widget.job['title'] ?? 'Job Title',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          widget.job['jobType'] ?? 'Full-time',
                          style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildInfoRow(Icons.location_on_outlined, widget.job['location'] ?? 'Remote'),
                  const SizedBox(height: 10),
                  _buildInfoRow(Icons.attach_money_outlined, 
                    widget.job['salaryMin'] != null ? '${widget.job['salaryMin']} - ${widget.job['salaryMax']} USD' : 'Competitive'),
                  const SizedBox(height: 10),
                  _buildInfoRow(Icons.access_time, 'Posted 2 days ago'),
                  
                  const Divider(height: 40),

                  // AI Analysis Section
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.indigo.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.indigo.withOpacity(0.1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.psychology, color: Colors.indigo),
                            const SizedBox(width: 10),
                            const Text('AI Match Analysis', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const Spacer(),
                            if (_isLoadingScore)
                              const SizedBox(width: 15, height: 15, child: CircularProgressIndicator(strokeWidth: 2))
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: Colors.indigo, borderRadius: BorderRadius.circular(10)),
                                child: Text('${_aiScore?['score'] ?? 0}%', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        if (!_isLoadingScore) ...[
                          Text(_aiScore?['summary'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.indigo)),
                          const SizedBox(height: 8),
                          Text(_aiScore?['details'] ?? 'Complete your profile for a better analysis!', style: const TextStyle(fontSize: 14, color: Colors.black87)),
                        ] else
                          const Text('Analyzing your profile suitability...', style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
                      ],
                    ),
                  ),
                  
                  const Divider(height: 40),
                  
                  const Text('Job Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Text(
                    widget.job['description'] ?? 'No description provided',
                    style: const TextStyle(fontSize: 16, height: 1.5, color: Colors.black87),
                  ),
                  
                  const SizedBox(height: 24),
                  const Text('Requirements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Text(
                    widget.job['requirements'] ?? 'No requirements listed',
                    style: const TextStyle(fontSize: 16, height: 1.5, color: Colors.black87),
                  ),
                  
                  const SizedBox(height: 100), // Space for bottom button
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: ElevatedButton(
          onPressed: _isApplying ? null : _showApplyDialog,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.indigo,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          ),
          child: _isApplying 
            ? const CircularProgressIndicator(color: Colors.white) 
            : const Text('Apply for this Job', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Text(text, style: TextStyle(fontSize: 16, color: Colors.grey[700])),
      ],
    );
  }
}
