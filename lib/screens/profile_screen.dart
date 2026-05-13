import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _profileData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final data = await _apiService.get('/profiles/me', token: token);
    setState(() {
      _profileData = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
                const SizedBox(height: 16),
                Text('${user?.firstName} ${user?.lastName}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                Text(user?.email ?? '', style: TextStyle(color: Colors.grey[600])),
                const SizedBox(height: 24),
                
                // Progress Bar (FR-12)
                LinearProgressIndicator(
                  value: (_profileData?['profileCompletionPercentage'] ?? 0) / 100,
                  backgroundColor: Colors.grey[200],
                ),
                const SizedBox(height: 8),
                Text('Profile Completion: ${_profileData?['profileCompletionPercentage'] ?? 0}%'),
                
                const SizedBox(height: 32),
                _buildInfoTile(Icons.school, 'University', _profileData?['university'] ?? 'Not set'),
                _buildInfoTile(Icons.book, 'Course', _profileData?['courseOfStudy'] ?? 'Not set'),
                _buildInfoTile(Icons.location_on, 'Location Preference', _profileData?['locationPreference'] ?? 'Not set'),
                
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: () {}, // Upload Resume
                  icon: const Icon(Icons.upload_file),
                  label: const Text('Upload Resume'),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      subtitle: Text(value),
      trailing: const Icon(Icons.edit, size: 20),
    );
  }
}
