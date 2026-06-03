
import java.util.Scanner;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

public class money {
    public static int findmin(int n, int k, int[] arr) {
        ArrayList<Integer> res = new ArrayList<>();
        for (int i = 0; i < arr.length - 1; i++) {
            if (arr[i] >= k && arr[i + 1] >= k) {
                return 0;
            }
        }
        int minCost = Integer.MAX_VALUE;
        for (int i = 0; i < arr.length - 1; i++) {
            int cost=Math.max(0, k-arr[i])+Math.max(0, k-arr[i+1]);
            minCost = Math.min(minCost, cost);
        }

        return minCost;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("hello");
        int n = sc.nextInt();
        int k = sc.nextInt();
        int arr[] = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        System.out.println("ans" + findmin(n, k, arr));
    }

}
