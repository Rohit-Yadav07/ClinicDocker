package com.appointment_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // public String generateToken(User user) {
    // return Jwts.builder()
    // .setSubject(user.getUsername())
    // .claim("id", user.getId())
    // .claim("role", user.getRole())
    // .setIssuedAt(new Date())
    // .setExpiration(new Date(System.currentTimeMillis() + expiration))
    // .signWith(SignatureAlgorithm.HS512, secret)
    // .compact();
    // }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}