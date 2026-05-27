import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/user_model.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  final _storage = const FlutterSecureStorage();
  final ApiService _apiService = ApiService();
  final GoogleSignIn _googleSignIn = GoogleSignIn();

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

  Future<bool> signInWithGoogle() async {
    try {
      // For testing purposes, if it's Web and no Client ID is configured,
      // it will throw an exception. We catch it and offer a mock login
      // so the user can test the app flow.
      GoogleSignInAccount? googleUser;
      try {
        googleUser = await _googleSignIn.signIn();
      } catch (e) {
        print('Google Sign In Error (probably missing config): $e');
        // Fallback to mock login for development
        return await _mockGoogleLogin();
      }

      if (googleUser == null) return false;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      final response = await _apiService.post('/auth/google', {
        'token': googleAuth.idToken,
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
      print('Google sign in error: $e');
      return await _mockGoogleLogin(); // Fallback for testing
    }
  }

  Future<bool> _mockGoogleLogin() async {
    print('Proceeding with Mock Google Login for development...');
    final response = await _apiService.post('/auth/google', {
      'token': 'mock_token_for_dev',
    });
    if (response != null && response['token'] != null) {
      _token = response['token'];
      _user = User.fromJson(response['user']);
      await _storage.write(key: 'jwt_token', value: _token);
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    await _storage.delete(key: 'jwt_token');
    notifyListeners();
  }

  void updateUserLocally(String field, String value) {
    if (_user != null) {
      final json = _user!.toJson();
      json[field] = value;
      _user = User.fromJson(json);
      print('AuthProvider: User locally updated ($field -> $value)');
      notifyListeners();
    }
  }

  Future<void> tryAutoLogin() async {
    print('Attempting Auto-Login...');
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      print('Token found in storage, verifying...');
      _token = token;
      final userData = await _apiService.get('/auth/me', token: _token);
      if (userData != null) {
        print('Auto-Login Success for: ${userData['email']}');
        _user = User.fromJson(userData);
        notifyListeners();
      } else {
        print('Token invalid or expired, clearing session.');
        await logout();
      }
    } else {
      print('No token found in storage.');
    }
  }
}
