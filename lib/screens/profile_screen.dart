import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'package:file_picker/file_picker.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _profileData;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final data = await _apiService.get('/profiles/me', token: token);
    print('Fetched Profile Data: $data');
    if (mounted) {
      setState(() {
        _profileData = data;
        _isLoading = false;
      });
    }
  }

  Future<void> _updateProfile(String field, String value) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.token;
    setState(() => _isSaving = true);

    final response = await _apiService.put('/profiles/me', {field: value}, token: token);
    
    if (response != null) {
      if (field == 'firstName' || field == 'lastName') {
        auth.updateUserLocally(field, value);
      }
      await _fetchProfile();
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!')),
        );
      }
    } else {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update profile.')),
        );
      }
    }
  }

  Future<void> _pickAndUploadResume() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx'],
        withData: true,
      );

      if (result != null) {
        setState(() => _isUploading = true);
        final file = result.files.first;
        final token = Provider.of<AuthProvider>(context, listen: false).token;

        final response = await _apiService.multipartPost(
          '/profiles/resume',
          'resume',
          file.bytes!,
          file.name,
          token: token,
        );

        setState(() => _isUploading = false);

        if (response != null) {
          _fetchProfile();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Resume uploaded successfully!')),
            );
          }
        }
      }
    } catch (e) {
      print('Error picking file: $e');
      setState(() => _isUploading = false);
    }
  }

  void _showEditDialog(String field, String label, String currentValue) {
    final controller = TextEditingController(text: currentValue);
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Edit $label'),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(labelText: label),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              await _updateProfile(field, controller.text);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final String role = user?.role ?? 'student';

    return Scaffold(
      appBar: AppBar(
        title: Text(role == 'employer' ? 'Company Profile' : 'My Profile'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          CircleAvatar(
                            radius: 60,
                            backgroundColor: Colors.indigo.withOpacity(0.1),
                            child: Icon(
                              role == 'employer' ? Icons.business : Icons.person,
                              size: 60,
                              color: Colors.indigo,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        role == 'employer' 
                          ? (_profileData?['companyName'] ?? 'Company Name')
                          : '${user?.firstName ?? ''} ${user?.lastName ?? ''}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      if (role != 'employer')
                        IconButton(
                          icon: const Icon(Icons.edit, size: 16),
                          onPressed: () => _showEditDialog('firstName', 'First Name', user?.firstName ?? ''),
                        ),
                      Text(
                        user?.email ?? '',
                        style: TextStyle(color: Colors.grey[600], fontSize: 16),
                      ),
                      const SizedBox(height: 30),
                      
                      Card(
                        elevation: 0,
                        color: Colors.indigo.withOpacity(0.05),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(role == 'employer' ? 'Profile Completion' : 'Profile Completion', 
                                    style: const TextStyle(fontWeight: FontWeight.bold)),
                                  Text('${_profileData?['profileCompletionPercentage'] ?? 0}%', 
                                    style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const SizedBox(height: 10),
                              LinearProgressIndicator(
                                value: ((_profileData?['profileCompletionPercentage'] ?? 0) as num).toDouble() / 100.0,
                                backgroundColor: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                minHeight: 8,
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 30),

                      if (role == 'employer') ...[
                        _buildSectionHeader('Company Information'),
                        _buildEditableTile(Icons.business, 'Company Name', _profileData?['companyName'] ?? 'Not set', 'companyName'),
                        _buildEditableTile(Icons.category, 'Industry', _profileData?['industry'] ?? 'Not set', 'industry'),
                        _buildEditableTile(Icons.language, 'Website', _profileData?['website'] ?? 'Not set', 'website'),
                        _buildEditableTile(Icons.info_outline, 'Description', _profileData?['description'] ?? 'Not set', 'description'),
                      ] else ...[
                        _buildSectionHeader('Personal Info'),
                        _buildEditableTile(Icons.person, 'First Name', user?.firstName ?? 'Not set', 'firstName'),
                        _buildEditableTile(Icons.person_outline, 'Last Name', user?.lastName ?? 'Not set', 'lastName'),

                        const SizedBox(height: 30),
                        _buildSectionHeader('Professional Info'),
                        if (role == 'student') ...[
                          _buildEditableTile(Icons.school, 'University', _profileData?['university'] ?? 'Not set', 'university'),
                          _buildEditableTile(Icons.book, 'Course', _profileData?['courseOfStudy'] ?? 'Not set', 'courseOfStudy'),
                        ] else ...[
                          _buildEditableTile(Icons.work_history, 'Years of Experience', _profileData?['yearsOfExperience']?.toString() ?? 'Not set', 'yearsOfExperience'),
                          _buildEditableTile(Icons.payments, 'Expected Salary', _profileData?['expectedSalary']?.toString() ?? 'Not set', 'expectedSalary'),
                        ],
                        _buildEditableTile(Icons.psychology, 'Skills', _profileData?['skills'] ?? 'Not set', 'skills'),
                        _buildEditableTile(Icons.location_on, 'Location Preference', _profileData?['locationPreference'] ?? 'Not set', 'locationPreference'),
                        
                        const SizedBox(height: 30),
                        _buildSectionHeader('Documents'),
                        ListTile(
                          leading: const Icon(Icons.description, color: Colors.indigo),
                          title: const Text('Resume / CV'),
                          subtitle: Text((_profileData?['resumeUrl'] != null && _profileData?['resumeUrl'].toString().isNotEmpty == true)
                            ? '✅ Resume uploaded' 
                            : '❌ No resume uploaded'),
                          trailing: _isUploading 
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : IconButton(
                                icon: const Icon(Icons.upload_file, color: Colors.indigo),
                                onPressed: _pickAndUploadResume,
                              ),
                        ),
                      ],
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
                if (_isSaving)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: LinearProgressIndicator(backgroundColor: Colors.indigo.withOpacity(0.1), color: Colors.indigo),
                  ),
              ],
            ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
    );
  }

  Widget _buildEditableTile(IconData icon, String label, String value, String field) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: Colors.indigo),
      ),
      title: Text(label, style: const TextStyle(fontSize: 14, color: Colors.grey)),
      subtitle: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black)),
      trailing: IconButton(
        icon: const Icon(Icons.edit_outlined, size: 20),
        onPressed: () => _showEditDialog(field, label, value == 'Not set' ? '' : value),
      ),
    );
  }
}
