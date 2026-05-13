import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/user_model.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  final _storage = const FlutterSecureStorage();
  final ApiService _apiService = ApiService();

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Future<bool> login(String email, String password) async {
    try {
      final response = await _apiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (response != null && response['token'] != null) {
        _token = response['token'];
        _user = User.fromJson(response['user']);
        await _storage.write(key: 'jwt_token', value: _token);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.post('/auth/register', userData);
      if (response != null && response['token'] != null) {
        _token = response['token'];
        _user = User.fromJson(response['user']);
        await _storage.write(key: 'jwt_token', value: _token);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Register error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    await _storage.delete(key: 'jwt_token');
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      _token = token;
      // Fetch user data from API using token
      final userData = await _apiService.get('/auth/me', token: _token);
      if (userData != null) {
        _user = User.fromJson(userData);
        notifyListeners();
      } else {
        await logout();
      }
    }
  }
}
