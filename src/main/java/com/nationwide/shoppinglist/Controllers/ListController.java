package com.nationwide.shoppinglist.Controllers;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nationwide.shoppinglist.Entity.List;
import com.nationwide.shoppinglist.Services.ListService;

@RestController
public class ListController {
	@Autowired
	private ListService service;
	
	@CrossOrigin
	@GetMapping("/showall")
	public ArrayList<List> showAll(){
		return service.showAll();
	}
	
	@CrossOrigin
	@PostMapping("/save")
	public String saveData(@RequestBody List Ref) {
			service.saveData(Ref);
			return "Data saved.";
	}
	
	@CrossOrigin
	@DeleteMapping("/deleteRecord/{R}")
	public String deleteRecord(@PathVariable int R) {
		service.deleteRecord(R);
		return "Record deleted";
	}
	
	@CrossOrigin
	@PutMapping("/updateItem")
	public List updateItem(@RequestBody List updatedItem) {
		List item2 = service.updateItem(updatedItem);
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
