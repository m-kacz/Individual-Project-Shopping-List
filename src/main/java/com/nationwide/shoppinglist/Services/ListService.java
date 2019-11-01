package com.nationwide.shoppinglist.Services;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nationwide.shoppinglist.Entity.List;
import com.nationwide.shoppinglist.Interfaces.ListRepository;

@RestController
public class ListService {
	@Autowired
	private ListRepository repo;
	
	public ArrayList<List> showAll(){
		return repo.findAll();
	}
	
	public String saveData(@RequestBody List Ref) {
			repo.save(Ref);
			return "Data saved.";
	}
	
	public String deleteRecord(@PathVariable int R) {
		repo.deleteById(R);
		return "Record deleted";
	}
	
	public List updateItem(@RequestBody List updatedItem) {
		List item2 = repo.findById(updatedItem.getId());
		item2.setItem(updatedItem.getItem());
		item2.setQuantity(updatedItem.getQuantity());
		item2.setPrice(updatedItem.getPrice());
		item2.setTotal(updatedItem.getTotal());
		item2.setPurchased(updatedItem.isPurchased());
		repo.flush();
		return item2;
	}
	
//	@GetMapping("/sortbyhigh")
//	public ArrayList<List> sortByHigh(){
//		return repo.findByOrderByTotalAsc();
//	}
//	@GetMapping("/sortbylow")
//	public ArrayList<List> sortByLow(){
//		return repo.findByOrderByTotalDes();
//	}
}
