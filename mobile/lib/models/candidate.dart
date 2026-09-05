class Candidate {
  final String id;
  final String fullName;
  final int age;
  final String gender;
  final String bio;
  final List<String> photos;
  final double distanceKm;
  final String city;

  Candidate({
    required this.id,
    required this.fullName,
    required this.age,
    required this.gender,
    required this.bio,
    required this.photos,
    required this.distanceKm,
    required this.city,
  });

  factory Candidate.fromJson(Map<String, dynamic> json) {
    return Candidate(
      id: json['id'] ?? '',
      fullName: json['full_name'] ?? '',
      age: json['age'] ?? 21,
      gender: json['gender'] ?? '',
      bio: json['bio'] ?? '',
      photos: List<String>.from(json['photos'] ?? []),
      distanceKm: (json['distance_km'] as num?)?.toDouble() ?? 0.0,
      city: json['city'] ?? '',
    );
  }
}
