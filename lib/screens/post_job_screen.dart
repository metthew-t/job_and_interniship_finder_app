import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class PostJobScreen extends StatefulWidget {
  const PostJobScreen({super.key});

  @override
  State<PostJobScreen> createState() => _PostJobScreenState();
}

class _PostJobScreenState extends State<PostJobScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiService _apiService = ApiService();
  
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _reqController = TextEditingController();
  final _locController = TextEditingController();
  final _minSalaryController = TextEditingController();
  final _maxSalaryController = TextEditingController();
  final _deadlineController = TextEditingController();
  
  DateTime? _selectedDeadline;
  String _jobType = 'full-time';
  String _workMode = 'remote';
  String _category = 'Technology';
  bool _isSubmitting = false;

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);
      
      final token = Provider.of<AuthProvider>(context, listen: false).token;
      final jobData = {
        'title': _titleController.text,
        'description': _descController.text,
        'requirements': _reqController.text,
        'location': _locController.text,
        'salaryMin': int.tryParse(_minSalaryController.text),
        'salaryMax': int.tryParse(_maxSalaryController.text),
        'jobType': _jobType,
        'workMode': _workMode,
        'category': _category,
        'deadline': _selectedDeadline?.toIso8601String(),
      };

      final response = await _apiService.post('/jobs', jobData, token: token);
      
      setState(() => _isSubmitting = false);

      if (response != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Job Posted Successfully!')),
          );
          Navigator.pop(context, true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to post job. Please check all fields.')),
          );
        }
      }
    }
  }

  void _selectDeadline() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _selectedDeadline = picked;
        _deadlineController.text = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Post New Job')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Job Title *'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(labelText: 'Category'),
                items: const [
                  DropdownMenuItem(value: 'Technology', child: Text('Technology')),
                  DropdownMenuItem(value: 'Finance', child: Text('Finance')),
                  DropdownMenuItem(value: 'Design', child: Text('Design')),
                  DropdownMenuItem(value: 'Marketing', child: Text('Marketing')),
                  DropdownMenuItem(value: 'Engineering', child: Text('Engineering')),
                ],
                onChanged: (v) => setState(() => _category = v!),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descController,
                decoration: const InputDecoration(labelText: 'Job Description *'),
                maxLines: 4,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _reqController,
                decoration: const InputDecoration(labelText: 'Requirements *'),
                maxLines: 3,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locController,
                decoration: const InputDecoration(labelText: 'Location (e.g. Remote, NY) *'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _minSalaryController,
                      decoration: const InputDecoration(labelText: 'Min Salary'),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _maxSalaryController,
                      decoration: const InputDecoration(labelText: 'Max Salary'),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _jobType,
                      decoration: const InputDecoration(labelText: 'Type'),
                      items: const [
                        DropdownMenuItem(value: 'full-time', child: Text('Full-time')),
                        DropdownMenuItem(value: 'part-time', child: Text('Part-time')),
                        DropdownMenuItem(value: 'internship', child: Text('Internship')),
                      ],
                      onChanged: (v) => setState(() => _jobType = v!),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _workMode,
                      decoration: const InputDecoration(labelText: 'Mode'),
                      items: const [
                        DropdownMenuItem(value: 'remote', child: Text('Remote')),
                        DropdownMenuItem(value: 'hybrid', child: Text('Hybrid')),
                        DropdownMenuItem(value: 'onsite', child: Text('Onsite')),
                      ],
                      onChanged: (v) => setState(() => _workMode = v!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _deadlineController,
                readOnly: true,
                onTap: _selectDeadline,
                decoration: const InputDecoration(
                  labelText: 'Application Deadline *',
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                validator: (v) => v!.isEmpty ? 'Please select a deadline' : null,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting 
                  ? const CircularProgressIndicator(color: Colors.white) 
                  : const Text('Post Job Listing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
