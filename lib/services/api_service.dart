import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class ApiService {
  String get baseUrl {
    // Chrome on same PC
    if (kIsWeb) return 'http://127.0.0.1:5000/api';
    // Physical Phone or Emulator
    return 'http://10.240.212.133:5000/api';
  }

  Future<dynamic> get(String endpoint, {String? token}) async {
    final url = '$baseUrl$endpoint';
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      return _processResponse(response, 'GET', url);
    } catch (e) {
      print('❌ GET Error ($url): $e');
      return null;
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body, {String? token}) async {
    final url = '$baseUrl$endpoint';
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );
      return _processResponse(response, 'POST', url);
    } catch (e) {
      print('❌ POST Error ($url): $e');
      return null;
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> body, {String? token}) async {
    final url = '$baseUrl$endpoint';
    try {
      print('📤 PUT $url body: ${jsonEncode(body)}');
      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );
      return _processResponse(response, 'PUT', url);
    } catch (e) {
      print('❌ PUT Error ($url): $e');
      return null;
    }
  }

  Future<dynamic> delete(String endpoint, {String? token}) async {
    final url = '$baseUrl$endpoint';
    try {
      final response = await http.delete(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      return _processResponse(response, 'DELETE', url);
    } catch (e) {
      print('❌ DELETE Error ($url): $e');
      return null;
    }
  }

  Future<dynamic> multipartPost(String endpoint, String fieldName, List<int> fileBytes, String filename, {String? token}) async {
    final url = '$baseUrl$endpoint';
    try {
      var request = http.MultipartRequest('POST', Uri.parse(url));
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.files.add(http.MultipartFile.fromBytes(
        fieldName,
        fileBytes,
        filename: filename,
      ));
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      return _processResponse(response, 'MULTIPART', url);
    } catch (e) {
      print('❌ Multipart POST Error ($url): $e');
      return null;
    }
  }

  dynamic _processResponse(http.Response response, String method, String url) {
    print('📥 $method $url → ${response.statusCode}');
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      print('❌ API Error (${response.statusCode}): ${response.body}');
      return null;
    }
  }
}
